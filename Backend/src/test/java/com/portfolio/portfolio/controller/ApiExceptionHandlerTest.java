package com.portfolio.portfolio.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.portfolio.portfolio.dto.ApiError;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

class ApiExceptionHandlerTest {
  private final ApiExceptionHandler handler = new ApiExceptionHandler();

  @Test
  void returnsReasonAndOriginalStatus() {
    ResponseEntity<ApiError> response =
        handler.handleResponseStatus(
            new ResponseStatusException(HttpStatus.BAD_REQUEST, "The file has no trade rows"));

    assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    assertEquals(new ApiError("The file has no trade rows"), response.getBody());
  }

  @Test
  void fallsBackWhenReasonIsMissing() {
    ResponseEntity<ApiError> response =
        handler.handleResponseStatus(new ResponseStatusException(HttpStatus.NOT_FOUND));

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertEquals(new ApiError("The request could not be completed"), response.getBody());
  }
}
