package com.portfolio.portfolio.controller;

import com.portfolio.portfolio.dto.ApiError;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiExceptionHandler {
  private static final String FALLBACK_MESSAGE = "The request could not be completed";

  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<ApiError> handleResponseStatus(ResponseStatusException exception) {
    String message =
        exception.getReason() == null || exception.getReason().isBlank()
            ? FALLBACK_MESSAGE
            : exception.getReason();
    return ResponseEntity.status(exception.getStatusCode()).body(new ApiError(message));
  }

  @ExceptionHandler(MaxUploadSizeExceededException.class)
  public ResponseEntity<ApiError> handleMaxUploadSize(MaxUploadSizeExceededException exception) {
    return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
        .body(new ApiError("The file is larger than the 10 MB upload limit"));
  }
}
