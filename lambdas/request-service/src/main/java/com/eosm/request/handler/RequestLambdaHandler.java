package com.eosm.request.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestStreamHandler;
import com.eosm.request.actions.CreateRequestAction;
import com.eosm.request.contract.GatewayRequest;
import com.eosm.request.contract.GatewayResponse;
import com.eosm.request.util.Json;

import java.io.*;
import java.nio.charset.StandardCharsets;

public class RequestLambdaHandler implements RequestStreamHandler {

  private final CreateRequestAction create = new CreateRequestAction();

  @Override
  public void handleRequest(InputStream input, OutputStream output, Context context) throws IOException {
    GatewayResponse<?> resp;

    try {
      String raw = readAllToString(input);
      GatewayRequest req = Json.MAPPER.readValue(raw, GatewayRequest.class);

      // вместо isBlank()
      if (req.action == null || req.action.trim().isEmpty()) {
        resp = GatewayResponse.fail("BAD_REQUEST", "Missing action");
      } else if ("CREATE_REQUEST".equals(req.action)) {
        resp = create.handle(req);
      } else {
        resp = GatewayResponse.fail("BAD_REQUEST", "Unknown action: " + req.action);
      }
    } catch (Exception e) {
      if (context != null) context.getLogger().log("Unhandled: " + e.toString());
      resp = GatewayResponse.fail("INTERNAL_ERROR", "Internal server error");
    }

    Json.MAPPER.writeValue(output, resp);
  }


  private static String readAllToString(InputStream input) throws IOException {
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    byte[] buffer = new byte[4096];
    int read;
    while ((read = input.read(buffer)) != -1) {
      baos.write(buffer, 0, read);
    }
    return new String(baos.toByteArray(), StandardCharsets.UTF_8);
  }
}

