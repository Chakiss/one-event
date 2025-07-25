import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Registration,
  RegistrationStatus,
} from './entities/registration.entity';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { RegistrationFilterDto } from './dto/registration-filter.dto';
import { EventService } from '../event/event.service';
import { EmailService } from '../../email/email.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class RegistrationService {
  constructor(
    @InjectRepository(Registration)
    private registrationRepository: Repository<Registration>,
    private eventService: EventService,
    private emailService: EmailService,
  ) {}

  async register(
    createRegistrationDto: CreateRegistrationDto,
    user?: User,
  ): Promise<Registration> {
    const {
      eventId,
      notes,
      additionalInfo,
      guestName,
      guestEmail,
      guestPhone,
      customFields,
      registrationSource,
      utmSource,
      utmMedium,
      utmCampaign,
    } = createRegistrationDto;

    // Check if event exists and is available for registration
    const event = await this.eventService.findOne(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if event registration is open
    if (!event.isRegistrationOpen) {
      throw new BadRequestException('Registration is not open for this event');
    }

    // For guest registration, require guest email
    if (!user && !guestEmail) {
      throw new BadRequestException(
        'Guest email is required for guest registration',
      );
    }

    // Check if user/guest is already registered
    let existingRegistration;
    if (user) {
      existingRegistration = await this.registrationRepository.findOne({
        where: { userId: user.id, eventId },
      });
    } else if (guestEmail) {
      existingRegistration = await this.registrationRepository.findOne({
        where: { guestEmail, eventId },
      });
    }

    if (existingRegistration) {
      throw new ConflictException(
        user
          ? 'User is already registered for this event'
          : 'This email is already registered for this event',
      );
    }

    // Check if event has available slots
    const registrationCount = await this.registrationRepository.count({
      where: {
        eventId,
        status: RegistrationStatus.CONFIRMED,
      },
    });

    if (registrationCount >= event.maxAttendees) {
      throw new BadRequestException('Event is fully booked');
    }

    // Create registration
    const registration = this.registrationRepository.create({
      userId: user?.id,
      eventId,
      notes,
      additionalInfo,
      guestName,
      guestEmail,
      guestPhone,
      customFields,
      registrationSource,
      utmSource,
      utmMedium,
      utmCampaign,
      status: RegistrationStatus.CONFIRMED, // Auto-confirm for now
      registeredAt: new Date(),
      confirmedAt: new Date(),
    });

    const savedRegistration =
      await this.registrationRepository.save(registration);

    // Send confirmation email
    try {
      const recipientEmail = user?.email || guestEmail!;
      const recipientName = user?.name || guestName || guestEmail!;

      await this.emailService.sendRegistrationConfirmation(recipientEmail, {
        guestName: recipientName,
        guestEmail: recipientEmail,
        registrationId: savedRegistration.id,
        eventTitle: event.title,
        eventDescription: event.description,
        eventDate: event.startDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        eventTime: event.startDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        eventLocation: event.location,
        eventUrl: `${process.env.FRONTEND_URL}/events/${event.id}`,
        customFields: customFields || additionalInfo,
      });
    } catch (error) {
      console.error('Failed to send registration confirmation:', error);
      // Don't fail the registration if email fails
    }

    return savedRegistration;
  }

  async findAll(filterDto: RegistrationFilterDto): Promise<{
    registrations: Registration[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { status, eventId, userId, page = 1, limit = 10 } = filterDto;

    const queryBuilder = this.registrationRepository
      .createQueryBuilder('registration')
      .leftJoinAndSelect('registration.user', 'user')
      .leftJoinAndSelect('registration.event', 'event')
      .leftJoinAndSelect('event.organizer', 'organizer');

    if (status) {
      queryBuilder.andWhere('registration.status = :status', { status });
    }

    if (eventId) {
      queryBuilder.andWhere('registration.eventId = :eventId', { eventId });
    }

    if (userId) {
      queryBuilder.andWhere('registration.userId = :userId', { userId });
    }

    queryBuilder
      .orderBy('registration.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [registrations, total] = await queryBuilder.getManyAndCount();

    return {
      registrations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Registration> {
    const registration = await this.registrationRepository.findOne({
      where: { id },
      relations: ['user', 'event', 'event.organizer'],
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    return registration;
  }

  async findMyRegistrations(user: User): Promise<Registration[]> {
    return this.registrationRepository.find({
      where: { userId: user.id },
      relations: ['event', 'event.organizer'],
      order: { createdAt: 'DESC' },
    });
  }

  async findEventRegistrations(eventId: string): Promise<Registration[]> {
    return this.registrationRepository.find({
      where: { eventId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findMyEventRegistrations(
    eventId: string,
    user: User,
  ): Promise<Registration[]> {
    // First, check if the user is the organizer of this event
    const event = await this.eventService.findOne(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException(
        'You can only view registrations for your own events',
      );
    }

    return this.registrationRepository.find({
      where: { eventId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    updateRegistrationDto: UpdateRegistrationDto,
    user: User,
  ): Promise<Registration> {
    const registration = await this.findOne(id);

    // Check permissions
    if (registration.userId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException(
        'You can only update your own registrations',
      );
    }

    Object.assign(registration, updateRegistrationDto);

    // Set timestamp based on status change
    if (updateRegistrationDto.status) {
      switch (updateRegistrationDto.status) {
        case RegistrationStatus.CONFIRMED:
          registration.confirmedAt = new Date();
          break;
        case RegistrationStatus.CANCELLED:
          registration.cancelledAt = new Date();
          break;
        case RegistrationStatus.ATTENDED:
          registration.attendedAt = new Date();
          break;
      }
    }

    return this.registrationRepository.save(registration);
  }

  async cancel(id: string, user: User): Promise<Registration> {
    return this.update(id, { status: RegistrationStatus.CANCELLED }, user);
  }

  async confirm(id: string, user: User): Promise<Registration> {
    const registration = await this.findOne(id);

    // Only event organizer or admin can confirm registrations
    if (registration.event.organizerId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException(
        'Only event organizer or admin can confirm registrations',
      );
    }

    const updatedRegistration = await this.update(
      id,
      { status: RegistrationStatus.CONFIRMED },
      user,
    );

    // Send approval email
    // TODO: Re-implement email notifications
    // void this.emailService.sendRegistrationApproved(
    //   registration.user.email,
    //   registration.user.email,
    //   registration.event.title,
    //   registration.event.startDate.toISOString(),
    //   registration.event.location,
    // );

    return updatedRegistration;
  }

  async markAttended(id: string, user: User): Promise<Registration> {
    const registration = await this.findOne(id);

    // Only event organizer or admin can mark attendance
    if (registration.event.organizerId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException(
        'Only event organizer or admin can mark attendance',
      );
    }

    return this.update(id, { status: RegistrationStatus.ATTENDED }, user);
  }

  async remove(id: string, user: User): Promise<void> {
    const registration = await this.findOne(id);

    // Check permissions
    if (registration.userId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException(
        'You can only delete your own registrations',
      );
    }

    await this.registrationRepository.remove(registration);
  }

  async getEventStats(eventId: string): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    attended: number;
    noShow: number;
  }> {
    const stats = await this.registrationRepository
      .createQueryBuilder('registration')
      .select('registration.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('registration.eventId = :eventId', { eventId })
      .groupBy('registration.status')
      .getRawMany();

    const result = {
      total: 0,
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      attended: 0,
      noShow: 0,
    };

    for (const stat of stats) {
      const count = parseInt((stat as { count: string }).count);
      result.total += count;

      switch ((stat as { status: RegistrationStatus }).status) {
        case RegistrationStatus.PENDING:
          result.pending = count;
          break;
        case RegistrationStatus.CONFIRMED:
          result.confirmed = count;
          break;
        case RegistrationStatus.CANCELLED:
          result.cancelled = count;
          break;
        case RegistrationStatus.ATTENDED:
          result.attended = count;
          break;
        case RegistrationStatus.NO_SHOW:
          result.noShow = count;
          break;
      }
    }

    return result;
  }

  async getMyEventStats(
    eventId: string,
    user: User,
  ): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    attended: number;
    noShow: number;
  }> {
    // First, check if the user is the organizer of this event
    const event = await this.eventService.findOne(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException(
        'You can only view statistics for your own events',
      );
    }

    // Use the existing getEventStats method
    return this.getEventStats(eventId);
  }
}
