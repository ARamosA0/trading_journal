package com.portfolio.portfolio.entity;

public enum AccountProvider {
  SIMPLEFX("SimpleFX"),
  BITGET("Bitget");

  private final String displayName;

  AccountProvider(String displayName) {
    this.displayName = displayName;
  }

  public String displayName() {
    return displayName;
  }
}
