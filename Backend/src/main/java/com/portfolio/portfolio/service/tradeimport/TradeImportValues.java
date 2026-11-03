package com.portfolio.portfolio.service.tradeimport;

import com.portfolio.portfolio.entity.TradeDirection;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoField;
import java.util.List;
import java.util.Locale;

final class TradeImportValues {
  private static final List<DateTimeFormatter> DATE_FORMATS =
      List.of(
          DateTimeFormatter.ISO_LOCAL_DATE_TIME,
          DateTimeFormatter.ISO_DATE_TIME,
          DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss", Locale.ROOT),
          DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm", Locale.ROOT),
          DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss", Locale.ROOT),
          dateTimeFormatter("d.M.uuuu H:mm:ss"),
          dateTimeFormatter("d/M/uuuu H:mm:ss"),
          dateTimeFormatter("M/d/uuuu h:mm:ss a"));

  private TradeImportValues() {}

  private static DateTimeFormatter dateTimeFormatter(String pattern) {
    return new DateTimeFormatterBuilder()
        .appendPattern(pattern)
        .optionalStart()
        .appendFraction(ChronoField.NANO_OF_SECOND, 0, 9, true)
        .optionalEnd()
        .toFormatter(Locale.ROOT);
  }

  static String requiredText(ImportTableRow row, String header) {
    String value = row.value(header);
    if (value == null || value.isBlank()) {
      throw row.invalid("missing " + header);
    }
    return value.trim();
  }

  static BigDecimal requiredDecimal(ImportTableRow row, String header) {
    return requiredDecimal(row, header, null);
  }

  static BigDecimal requiredDecimal(ImportTableRow row, String header, String unit) {
    BigDecimal value = decimal(row, header, requiredText(row, header), unit);
    return value;
  }

  static BigDecimal requiredPositiveDecimal(ImportTableRow row, String header) {
    return requiredPositiveDecimal(row, header, null);
  }

  static BigDecimal requiredPositiveDecimal(ImportTableRow row, String header, String unit) {
    BigDecimal value = requiredDecimal(row, header, unit);
    if (value.signum() <= 0) {
      throw row.invalid(header + " must be greater than zero");
    }
    return value;
  }

  static BigDecimal optionalDecimal(ImportTableRow row, String header) {
    return optionalDecimal(row, header, null);
  }

  static BigDecimal optionalDecimal(ImportTableRow row, String header, String unit) {
    String rawValue = row.value(header);
    return rawValue == null || rawValue.isBlank()
        ? null
        : decimal(row, header, rawValue.trim(), unit);
  }

  static LocalDateTime requiredDateTime(ImportTableRow row, String header) {
    String value = requiredText(row, header);
    for (DateTimeFormatter formatter : DATE_FORMATS) {
      try {
        return LocalDateTime.parse(value, formatter);
      } catch (DateTimeParseException ignored) {
        // Try the next export date format.
      }
    }
    throw row.invalid(header + " has an unsupported date/time format");
  }

  static TradeDirection simpleFxDirection(ImportTableRow row, String header) {
    String value = requiredText(row, header).toLowerCase(Locale.ROOT);
    return switch (value) {
      case "buy", "long" -> TradeDirection.LONG;
      case "sell", "short" -> TradeDirection.SHORT;
      default -> throw row.invalid(header + " must be Buy/Long or Sell/Short");
    };
  }

  private static BigDecimal decimal(
      ImportTableRow row, String header, String rawValue, String unit) {
    try {
      String value = rawValue.trim();
      if (unit != null && value.toUpperCase(Locale.ROOT).endsWith(unit.toUpperCase(Locale.ROOT))) {
        value = value.substring(0, value.length() - unit.length()).trim();
      }
      return new BigDecimal(normalizeDecimal(value));
    } catch (NumberFormatException exception) {
      throw row.invalid(header + " must be a decimal number");
    }
  }

  private static String normalizeDecimal(String value) {
    int comma = value.lastIndexOf(',');
    int dot = value.lastIndexOf('.');
    if (comma >= 0 && dot >= 0) {
      char decimalSeparator = comma > dot ? ',' : '.';
      char groupingSeparator = decimalSeparator == ',' ? '.' : ',';
      int decimalIndex = Math.max(comma, dot);
      String integer = value.substring(0, decimalIndex);
      String fraction = value.substring(decimalIndex + 1);
      if (!isGroupedInteger(integer, groupingSeparator) || !fraction.matches("\\d+")) {
        throw new NumberFormatException();
      }
      return integer.replace(String.valueOf(groupingSeparator), "") + "." + fraction;
    }
    if (comma >= 0) {
      if (comma != value.indexOf(',')) {
        if (!isGroupedInteger(value, ',')) {
          throw new NumberFormatException();
        }
        return value.replace(",", "");
      }
      // shortcut: a lone comma means decimal, use both separators to disambiguate grouped integers.
      return value.replace(',', '.');
    }
    return value;
  }

  private static boolean isGroupedInteger(String value, char separator) {
    String escapedSeparator = separator == '.' ? "\\." : ",";
    return value.matches("[+-]?\\d{1,3}(?:" + escapedSeparator + "\\d{3})+");
  }
}
