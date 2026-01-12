package com.eosm.request.util;

public final class Val {
  private Val() {}
  public static boolean blank(String s) { return s == null || s.trim().isEmpty(); }
  public static String str(Object o) { return o == null ? null : String.valueOf(o); }
}
