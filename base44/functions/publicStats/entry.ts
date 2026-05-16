import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const [users, logs, posts] = await Promise.all([
      base44.asServiceRole.entities.User.list(),
      base44.asServiceRole.entities.DailyLog.list('-date', 10000),
      base44.asServiceRole.entities.CommunityPost.list('-created_date', 10000),
    ]);

    const memberCount = users.length;
    const habitsTracked = logs.reduce((sum, l) => sum + (l.habits_done?.length || 0), 0);
    const storiesCount = posts.length;

    return Response.json({ memberCount, habitsTracked, storiesCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});