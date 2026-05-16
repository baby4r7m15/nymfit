import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const userId = payload?.event?.entity_id || payload?.data?.id;
    if (!userId) return Response.json({ ok: true });

    // Get total user count
    const allUsers = await base44.asServiceRole.entities.User.list();
    const signupNumber = allUsers.length;

    // Get the new user
    const users = await base44.asServiceRole.entities.User.filter({ id: userId });
    const newUser = users?.[0];
    if (!newUser) return Response.json({ ok: true });

    const badgesToGrant = [];
    let grantPremium = false;

    if (signupNumber <= 10) {
      badgesToGrant.push('early_member');
      grantPremium = true;
    }
    if (signupNumber <= 100) {
      badgesToGrant.push('first_100');
    }

    if (badgesToGrant.length > 0) {
      const existingBadges = newUser.earned_badges || [];
      const updates = {
        earned_badges: [...new Set([...existingBadges, ...badgesToGrant])],
      };
      if (grantPremium) updates.is_premium = true;

      await base44.asServiceRole.entities.User.update(userId, updates);
    }

    return Response.json({ ok: true, signupNumber, badgesToGrant });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});