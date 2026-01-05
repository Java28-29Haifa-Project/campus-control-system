package com.eosm.request.util;

import com.fasterxml.jackson.databind.ObjectMapper;

public final class Json {
  private Json() {}
  public static final ObjectMapper MAPPER = new ObjectMapper();
}

