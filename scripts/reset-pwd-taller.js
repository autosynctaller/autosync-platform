// Script para resetear password de un usuario taller
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const db = new PrismaClient();

(async () => {
  const newPassword = 'test1234';
  const hashed = await bcrypt.hash(newPassword, 10);
  
  // Resetear password del usuario ejemplo@ejemplo.com
  const updated = await db.user.update({
    where: { email: 'ejemplo@ejemplo.com' },
    data: { password: hashed }
  });
  
  console.log('Password reseteada para:', updated.email);
  console.log('Nueva password: test1234');
  
  await db.$disconnect();
})();
