import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';

// Mock nodemailer properly
const mockSendMail = jest.fn().mockResolvedValue({
  messageId: 'test-message-id',
});

const mockCreateTransport = jest.fn().mockReturnValue({
  sendMail: mockSendMail,
});

jest.mock('nodemailer', () => ({
  createTransport: mockCreateTransport,
}));

describe.skip('EmailService', () => {
  let service: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);

    // Clear all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send registration confirmation email', async () => {
    const result = await service.sendRegistrationConfirmation(
      'test@example.com',
      'John Doe',
      'verification-token',
    );

    expect(result).toHaveProperty('success');
    expect(result.success).toBe(true);
    expect(result).toHaveProperty('messageId');
  });

  it('should send registration approved email', async () => {
    const result = await service.sendRegistrationApproved(
      'test@example.com',
      'John Doe',
      'Test Event',
      '2024-12-25T10:00:00Z',
      'Test Location',
    );

    expect(result).toHaveProperty('success');
    expect(result.success).toBe(true);
    expect(result).toHaveProperty('messageId');
  });

  it('should send event cancellation email', async () => {
    const result = await service.sendEventCancellation(
      'test@example.com',
      'John Doe',
      'Test Event',
      'Technical difficulties',
    );

    expect(result).toHaveProperty('success');
    expect(result.success).toBe(true);
    expect(result).toHaveProperty('messageId');
  });

  it('should send event reminder email', async () => {
    const result = await service.sendEventReminder(
      'test@example.com',
      'John Doe',
      'Test Event',
      '2024-12-25T10:00:00Z',
      'Test Location',
    );

    expect(result).toHaveProperty('success');
    expect(result.success).toBe(true);
    expect(result).toHaveProperty('messageId');
  });
});
