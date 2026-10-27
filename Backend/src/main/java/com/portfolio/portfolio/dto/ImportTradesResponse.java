package com.portfolio.portfolio.dto;

import java.util.List;

public record ImportTradesResponse(int imported, int rejected, List<String> errors) {
}
