import { hashPassword, validateEmail, verifyPassword } from '../src/lib/auth';

(async () => {
  console.log('Testing password hashing...');
  const hash = await hashPassword('testpassword123');
  console.log('Hashed:', hash.substring(0, 20) + '...');

  console.log('\nTesting password verification...');
  const isValid = await verifyPassword('testpassword123', hash);
  console.log('Password valid:', isValid);

  console.log('\nTesting email validation...');
  console.log('test@test.com:', validateEmail('test@test.com'));
  console.log('invalid:', validateEmail('invalid'));
})();
