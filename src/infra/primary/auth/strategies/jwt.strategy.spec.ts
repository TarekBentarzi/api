import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    strategy = new JwtStrategy();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user data from payload', () => {
      const payload = { sub: '123', email: 'test@example.com' };
      const result = strategy.validate(payload);

      expect(result).toEqual({
        userId: '123',
        email: 'test@example.com',
      });
    });

    it('should extract userId from sub claim', () => {
      const payload = { sub: 'user-456', email: 'user@example.com' };
      const result = strategy.validate(payload);

      expect(result.userId).toBe('user-456');
    });

    it('should preserve email from payload', () => {
      const payload = { sub: '789', email: 'another@example.com' };
      const result = strategy.validate(payload);

      expect(result.email).toBe('another@example.com');
    });
  });
});
