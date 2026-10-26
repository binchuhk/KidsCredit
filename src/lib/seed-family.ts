import { prisma } from "./prisma";

export async function seedFamilyDefaults(familyId: string) {
  const taskCount = await prisma.task.count({ where: { familyId } });
  if (taskCount === 0) {
    await prisma.task.createMany({
      data: [
        { familyId, title: "象棋赢一盘", icon: "♟️", points: 10 },
        { familyId, title: "游泳一次", icon: "🏊", points: 5 },
      ],
    });
  }

  if (prisma.penalty) {
    const penaltyCount = await prisma.penalty.count({ where: { familyId } });
    if (penaltyCount === 0) {
      await prisma.penalty.createMany({
        data: [
          { familyId, title: "不听话", icon: "😤", points: 5 },
          { familyId, title: "迟到", icon: "⏰", points: 3 },
        ],
      });
    }
  }

  const rewardCount = await prisma.reward.count({ where: { familyId } });
  if (rewardCount === 0) {
    await prisma.reward.create({
      data: { familyId, title: "小礼物", icon: "🎁", cost: 30 },
    });
  }
}

export function makeInviteCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}
