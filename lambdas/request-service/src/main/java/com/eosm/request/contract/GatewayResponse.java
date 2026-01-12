package com.eosm.request.contract;

public class GatewayResponse<T> {
  public boolean ok;
  public T data;
  public ErrorBody error;

  public static <T> GatewayResponse<T> ok(T data) {
    var r = new GatewayResponse<T>();
    r.ok = true;
    r.data = data;
    return r;
  }

  public static <T> GatewayResponse<T> fail(String code, String message) {
    var r = new GatewayResponse<T>();
    r.ok = false;
    r.error = new ErrorBody(code, message);
    return r;
  }

  public static class ErrorBody {
    public String code;
    public String message;
    public ErrorBody() {}
    public ErrorBody(String code, String message) { this.code = code; this.message = message; }
  }
}


