import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { RegistrationService } from './registration.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';

@ApiTags('Public Registration')
@Controller('public/registrations')
export class PublicRegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post()
  @ApiOperation({
    summary: 'Register for an event as a guest (no authentication required)',
  })
  @ApiBody({ type: CreateRegistrationDto })
  @ApiResponse({
    status: 201,
    description: 'Successfully registered for event',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-string' },
        eventId: { type: 'string', example: 'uuid-string' },
        status: { type: 'string', example: 'confirmed' },
        guestEmail: { type: 'string', example: 'john@example.com' },
        registeredAt: { type: 'string', example: '2023-12-07T10:30:00.000Z' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 409,
    description: 'Email already registered for this event',
  })
  registerAsGuest(@Body() createRegistrationDto: CreateRegistrationDto) {
    return this.registrationService.register(createRegistrationDto);
  }
}
