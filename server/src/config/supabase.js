import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { env } from "./env.js";

// Service-role client — full storage access, server-side only. Never expose this client or its
// key to the browser (see D2).
//
// The client eagerly constructs a Realtime (websocket) subsystem even though we only use
// Storage. Node 20 has no native WebSocket global, which crashes that construction — this is
// Supabase's own documented fix for Node < 22: supply the "ws" package as the transport.
export const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  realtime: { transport: ws },
});
