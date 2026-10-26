import { prisma } from "./prisma";

export async function seedFamilyDefaults(familyId: string) {
  const taskCount = await prisma.task.count({ where: { familyId } });
  if (taskCount === 0) {
    await prisma.task.createMany({
      data: [
        { familyId, title: "象棋赢一盘", points: 10 },
        { familyId, title: "游泳一次", points: 5 },
      ],
    });
  }

  // penalty 模型需 Prisma Client 已 generate；热重载若仍是旧 client 则跳过
  if (prisma.penalty) {
    const penaltyCount = await prisma.penalty.count({ where: { familyId } });
    if (penaltyCount === 0) {
      await prisma.penalty.createMany({
        data: [
          { familyId, title: "不听话", points: 5 },
          { familyId, title: "迟到", points: 3 },
        ],
      });
    }
  }

  const rewardCount = await prisma.reward.count({ where: { familyId } });
  if (rewardCount === 0) {
    await prisma.reward.create({
      data: { familyId, title: "小礼物", cost: 30 },
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
