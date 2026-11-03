package com.portfolio.portfolio.service.tradeimport;

import java.util.List;

public record ImportTable(List<String> headers, List<ImportTableRow> rows) {}
