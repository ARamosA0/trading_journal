package com.portfolio.portfolio.service.tradeimport;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Component
public class TradeImportFileReader {
  private static final Set<String> SUPPORTED_EXTENSIONS = Set.of("csv", "xls", "xlsx");

  public ImportTable read(MultipartFile file) {
    if (file == null || file.isEmpty()) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Choose a non-empty CSV or Excel file");
    }
    String extension = extension(file.getOriginalFilename());
    if (!SUPPORTED_EXTENSIONS.contains(extension)) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Only CSV, XLS, and XLSX files are supported");
    }

    try (InputStream input = file.getInputStream()) {
      return extension.equals("csv") ? readCsv(input) : readExcel(input);
    } catch (IllegalArgumentException exception) {
      String message = exception.getMessage();
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          message == null || message.isBlank() ? "The uploaded file could not be read" : message,
          exception);
    } catch (Exception exception) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "The uploaded file could not be read", exception);
    }
  }

  static String normalizeHeader(String header) {
    return header == null ? "" : header.replace("\uFEFF", "").trim().toLowerCase(Locale.ROOT);
  }

  private ImportTable readCsv(InputStream input) throws IOException {
    CSVFormat format =
        CSVFormat.DEFAULT
            .builder()
            .setHeader()
            .setSkipHeaderRecord(true)
            .setIgnoreEmptyLines(true)
            .setTrim(true)
            .build();
    try (CSVParser parser = format.parse(new InputStreamReader(input, StandardCharsets.UTF_8))) {
      List<String> headers = normalizeHeaders(parser.getHeaderNames());
      validateHeaders(headers);
      List<ImportTableRow> rows = new ArrayList<>();
      for (CSVRecord record : parser) {
        if (!record.isConsistent()) {
          throw new IllegalArgumentException(
              "CSV row " + (record.getRecordNumber() + 1) + " has an unexpected number of columns");
        }
        Map<String, String> values = new LinkedHashMap<>();
        for (int column = 0; column < headers.size(); column++) {
          values.put(headers.get(column), record.get(column).trim());
        }
        if (!isBlank(values)) {
          rows.add(new ImportTableRow((int) record.getRecordNumber() + 1, Map.copyOf(values)));
        }
      }
      return new ImportTable(List.copyOf(headers), List.copyOf(rows));
    }
  }

  private ImportTable readExcel(InputStream input) throws Exception {
    try (Workbook workbook = WorkbookFactory.create(input)) {
      if (workbook.getNumberOfSheets() == 0) {
        throw new IllegalArgumentException("The Excel workbook has no sheets");
      }
      Sheet sheet = workbook.getSheetAt(0);
      Row headerRow = sheet.getRow(sheet.getFirstRowNum());
      if (headerRow == null) {
        throw new IllegalArgumentException("The Excel sheet has no header row");
      }

      DataFormatter formatter = new DataFormatter(Locale.ROOT);
      int firstColumn = Math.max(0, headerRow.getFirstCellNum());
      int lastColumn = headerRow.getLastCellNum();
      while (lastColumn > firstColumn
          && cellValue(headerRow.getCell(lastColumn - 1), formatter).isBlank()) {
        lastColumn--;
      }
      List<String> headers = new ArrayList<>();
      for (int column = firstColumn; column < lastColumn; column++) {
        headers.add(normalizeHeader(cellValue(headerRow.getCell(column), formatter)));
      }
      validateHeaders(headers);

      List<ImportTableRow> rows = new ArrayList<>();
      for (int rowIndex = headerRow.getRowNum() + 1;
          rowIndex <= sheet.getLastRowNum();
          rowIndex++) {
        Row row = sheet.getRow(rowIndex);
        if (row == null) {
          continue;
        }
        Map<String, String> values = new LinkedHashMap<>();
        for (int column = 0; column < headers.size(); column++) {
          values.put(headers.get(column), cellValue(row.getCell(firstColumn + column), formatter));
        }
        if (!isBlank(values)) {
          rows.add(new ImportTableRow(rowIndex + 1, Map.copyOf(values)));
        }
      }
      return new ImportTable(List.copyOf(headers), List.copyOf(rows));
    }
  }

  private List<String> normalizeHeaders(List<String> headers) {
    return headers.stream().map(TradeImportFileReader::normalizeHeader).toList();
  }

  private void validateHeaders(List<String> headers) {
    if (headers.isEmpty() || headers.stream().anyMatch(String::isBlank)) {
      throw new IllegalArgumentException("The file must have a header for every column");
    }
    if (new HashSet<>(headers).size() != headers.size()) {
      throw new IllegalArgumentException("The file contains duplicate column headers");
    }
  }

  private String cellValue(Cell cell, DataFormatter formatter) {
    if (cell == null) {
      return "";
    }
    if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
      return DateUtil.getLocalDateTime(cell.getNumericCellValue()).toString();
    }
    return formatter.formatCellValue(cell).trim();
  }

  private boolean isBlank(Map<String, String> values) {
    return values.values().stream().allMatch(String::isBlank);
  }

  private String extension(String filename) {
    if (filename == null || filename.lastIndexOf('.') < 0) {
      return "";
    }
    return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
  }
}
