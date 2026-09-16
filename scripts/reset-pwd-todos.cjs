// Resetear passwords de admin y usuario dueño
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const db = new PrismaClient();

(async () => {
  const newPwdAdmin = 'admin123';
  const newPwdDueno = 'test1234';
  
  const h1 = await bcrypt.hash(newPwdAdmin, 10);
  const h2 = await bcrypt.hash(newPwdDueno, 10);
  
  await db.user.update({ where: { email: 'admin@autosync.com.ar' }, data: { password: h1 } });
  console.log('admin@autosync.com.ar → password: admin123');
  
  await db.user.update({ where: { email: 'gep89dmq@outlook.es' }, data: { password: h2 } });
  console.log('gep89dmq@outlook.es → password: test1234');
  
  // Verificar todas las credenciales
  console.log('\n=== Verificación con bcrypt ===');
  const users = await db.user.findMany({ select: { email: true, password: true, rol: true } });
  for (const u of users) {
    if (u.email === 'admin@autosync.com.ar') {
      const ok = await bcrypt.compare('admin123', u.password);
      console.log(`${u.email} (${u.rol}) - verify "admin123": ${ok}`);
    } else if (u.email === 'gep89dmq@outlook.es') {
      const ok = await bcrypt.compare('test1234', u.password);
      console.log(`${u.email} (${u.rol}) - verify "test1234": ${ok}`);
    } else if (u.email === 'ejemplo@ejemplo.com') {
      const ok = await bcrypt.compare('test1234', u.password);
      console.log(`${u.email} (${u.rol}) - verify "test1234": ${ok}`);
    }
  }
  
  await db.$disconnect();
})();
