package com.eosm.request.actions;

import com.eosm.request.contract.GatewayRequest;
import com.eosm.request.contract.GatewayResponse;
import com.eosm.request.util.Val;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public class CreateRequestAction {
  public GatewayResponse<?> handle(GatewayRequest req) {
    if (req.payload == null) return GatewayResponse.fail("BAD_REQUEST", "Missing payload");

    String category = Val.str(req.payload.get("category"));
    String subject = Val.str(req.payload.get("subject"));
    String description = Val.str(req.payload.get("description"));
    String prio = Val.str(req.payload.get("userReportedPriority"));

    if (Val.blank(category) || Val.blank(subject) || Val.blank(description) || Val.blank(prio)) {
      return GatewayResponse.fail("BAD_REQUEST", "Missing required fields");
    }

    String requestId = "req-" + UUID.randomUUID();
    String requestNumber = "REQ-" + System.currentTimeMillis();

    return GatewayResponse.ok(Map.of(
      "requestId", requestId,
      "requestNumber", requestNumber,
      "category", category,
      "subject", subject,
      "description", description,
      "userReportedPriority", prio,
      "status", "new",
      "createdAt", Instant.now().toString(),
      "message", "ok"
    ));
  }
}
