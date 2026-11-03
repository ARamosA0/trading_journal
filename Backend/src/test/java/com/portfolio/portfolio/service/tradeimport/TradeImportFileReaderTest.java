package com.portfolio.portfolio.service.tradeimport;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

class TradeImportFileReaderTest {
  private final TradeImportFileReader reader = new TradeImportFileReader();

  @Test
  void readsCsvHeadersAndRowsCaseInsensitively() {
    String csv = "\uFEFFSymbol,Side\r\nBTCUSDT,Buy\r\n";
    MockMultipartFile file =
        new MockMultipartFile(
            "file", "history.CSV", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

    ImportTable table = reader.read(file);

    assertEquals(2, table.headers().size());
    assertEquals("symbol", table.headers().get(0));
    assertEquals("buy", table.rows().get(0).value("Side").toLowerCase());
    assertEquals(2, table.rows().get(0).rowNumber());
  }

  @Test
  void readsXlsxCellValues() throws Exception {
    byte[] workbookBytes;
    try (XSSFWorkbook workbook = new XSSFWorkbook();
        ByteArrayOutputStream output = new ByteArrayOutputStream()) {
      var sheet = workbook.createSheet("Position History");
      var header = sheet.createRow(0);
      header.createCell(0).setCellValue("Futures");
      header.createCell(1).setCellValue("Closed amount");
      var data = sheet.createRow(1);
      data.createCell(0).setCellValue("BTCUSDT Short·Cross");
      data.createCell(1).setCellValue(2.99796);
      workbook.write(output);
      workbookBytes = output.toByteArray();
    }
    MockMultipartFile file =
        new MockMultipartFile(
            "file",
            "position-history.xlsx",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            workbookBytes);

    ImportTable table = reader.read(file);

    assertEquals("BTCUSDT Short·Cross", table.rows().get(0).value("Futures"));
    assertEquals("2.99796", table.rows().get(0).value("Closed amount"));
  }

  @Test
  void reportsDuplicateHeadersInsteadOfGenericReadFailure() {
    MockMultipartFile file =
        new MockMultipartFile(
            "file",
            "duplicated.csv",
            "text/csv",
            "Symbol,Symbol\nBTCUSDT,BTCUSDT\n".getBytes(StandardCharsets.UTF_8));

    ResponseStatusException exception =
        assertThrows(ResponseStatusException.class, () -> reader.read(file));

    assertEquals(400, exception.getStatusCode().value());
    assertTrue(exception.getReason().contains("duplicate column headers"));
  }

  @Test
  void reportsInconsistentCsvRows() {
    MockMultipartFile file =
        new MockMultipartFile(
            "file",
            "broken.csv",
            "text/csv",
            "Symbol,Side\nBTCUSDT,Buy,extra\n".getBytes(StandardCharsets.UTF_8));

    ResponseStatusException exception =
        assertThrows(ResponseStatusException.class, () -> reader.read(file));

    assertEquals(400, exception.getStatusCode().value());
    assertTrue(exception.getReason().contains("unexpected number of columns"));
  }
}
