import clientPromise from "@/lib/mongodb";

export async function checkAndIncrementAiUsage(agentId: string, limit = 10) {
  const client = await clientPromise;
  const db = client.db("VastgoedExclusief_DB");
  const col = db.collection("ai_usage");

  const month = new Date().toISOString().slice(0, 7); // YYYY-MM

  const doc = await col.findOne({ agentId, month });

  if (doc && doc.count >= limit) {
    return { allowed: false, count: doc.count, limit };
  }

  await col.updateOne(
    { agentId, month },
    {
      $setOnInsert: { agentId, month, limit },
      $inc: { count: 1 },
      $set: { updatedAt: new Date() },
    },
    { upsert: true }
  );

  const updated = await col.findOne({ agentId, month });

  return {
    allowed: true,
    count: updated?.count ?? 1,
    limit,
  };
}
