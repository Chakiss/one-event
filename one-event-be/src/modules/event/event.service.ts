import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, Between } from 'typeorm';
import { Event, EventStatus } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventFilterDto } from './dto/event-filter.dto';
import { UpdateEventLandingPageDto } from './dto/landing-page.dto';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto, organizer: User): Promise<Event> {
    // Validate dates
    if (new Date(createEventDto.startDate) >= new Date(createEventDto.endDate)) {
      throw new BadRequestException('End date must be after start date');
    }

    if (new Date(createEventDto.startDate) <= new Date()) {
      throw new BadRequestException('Start date must be in the future');
    }

    // Validate registration deadline
    if (
      createEventDto.registrationDeadline &&
      new Date(createEventDto.registrationDeadline) > new Date(createEventDto.startDate)
    ) {
      throw new BadRequestException(
        'Registration deadline must be before start date',
      );
    }

    const event = this.eventRepository.create({
      ...createEventDto,
      organizerId: organizer.id,
    });

    return this.eventRepository.save(event);
  }

  async findAll(filterDto: EventFilterDto): Promise<{
    events: Event[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, ...filters } = filterDto;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Event> = {};

    // Apply filters
    if (filters.search) {
      where.title = Like(`%${filters.search}%`);
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.organizerId) {
      where.organizerId = filters.organizerId;
    }

    if (filters.location) {
      where.location = Like(`%${filters.location}%`);
    }

    if (filters.startDate || filters.endDate) {
      const startDate = filters.startDate ? new Date(filters.startDate) : new Date('1900-01-01');
      const endDate = filters.endDate ? new Date(filters.endDate) : new Date('2100-12-31');
      where.startDate = Between(startDate, endDate);
    }

    const [events, total] = await this.eventRepository.findAndCount({
      where,
      order: { startDate: 'ASC' },
      skip,
      take: limit,
      relations: ['organizer'],
    });

    return {
      events,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findPublished(): Promise<Event[]> {
    return this.eventRepository.find({
      where: { status: EventStatus.PUBLISHED },
      order: { startDate: 'ASC' },
      relations: ['organizer'],
    });
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['organizer'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async findMyEvents(organizerId: string): Promise<Event[]> {
    return this.eventRepository.find({
      where: { organizerId },
      order: { createdAt: 'DESC' },
      relations: ['organizer'],
    });
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    user: User,
  ): Promise<Event> {
    const event = await this.findOne(id);

    // Check permissions
    if (event.organizerId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('You can only update your own events');
    }

    // Validate dates if provided
    const startDate = updateEventDto.startDate
      ? new Date(updateEventDto.startDate)
      : event.startDate;
    const endDate = updateEventDto.endDate
      ? new Date(updateEventDto.endDate)
      : event.endDate;

    if (startDate >= endDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Don't allow updating past events (unless admin)
    if (user.role !== 'admin' && event.startDate <= new Date()) {
      throw new BadRequestException('Cannot update past events');
    }

    await this.eventRepository.update(id, updateEventDto);
    return this.findOne(id);
  }

  async remove(id: string, user: User): Promise<void> {
    const event = await this.findOne(id);

    // Check permissions
    if (event.organizerId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('You can only delete your own events');
    }

    // Don't allow deleting events that already started (unless admin)
    if (user.role !== 'admin' && event.startDate <= new Date()) {
      throw new BadRequestException('Cannot delete events that have already started');
    }

    await this.eventRepository.remove(event);
  }

  async publishEvent(id: string, user: User): Promise<Event> {
    const event = await this.findOne(id);

    // Check permissions
    if (event.organizerId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('You can only publish your own events');
    }

    if (event.status !== EventStatus.DRAFT) {
      throw new BadRequestException('Only draft events can be published');
    }

    // Validate event is ready for publishing
    if (!event.title || !event.description || !event.startDate || !event.location) {
      throw new BadRequestException('Event is missing required information for publishing');
    }

    await this.eventRepository.update(id, { status: EventStatus.PUBLISHED });
    return this.findOne(id);
  }

  async cancelEvent(id: string, user: User): Promise<Event> {
    const event = await this.findOne(id);

    // Check permissions
    if (event.organizerId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('You can only cancel your own events');
    }

    if (event.status === EventStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed events');
    }

    await this.eventRepository.update(id, { status: EventStatus.CANCELLED });
    return this.findOne(id);
  }

  // Landing Page Methods
  async updateLandingPage(
    id: string,
    updateLandingPageDto: UpdateEventLandingPageDto,
    userId: string,
  ): Promise<Event> {
    const event = await this.findOne(id);

    // Check permissions
    if (event.organizerId !== userId) {
      throw new ForbiddenException('You can only edit your own events');
    }

    // Generate slug if provided and ensure uniqueness
    if (updateLandingPageDto.slug) {
      const existingEvent = await this.eventRepository.findOne({
        where: { slug: updateLandingPageDto.slug },
      });
      
      if (existingEvent && existingEvent.id !== id) {
        throw new BadRequestException('Slug already exists');
      }
    }

    // Update the event with landing page data
    await this.eventRepository.update(id, {
      landingPageHtml: updateLandingPageDto.landingPageHtml,
      landingPageConfig: updateLandingPageDto.landingPageConfig,
      customCss: updateLandingPageDto.customCss,
      customJs: updateLandingPageDto.customJs,
      slug: updateLandingPageDto.slug,
    });

    return this.findOne(id);
  }

  async getLandingPageConfig(id: string): Promise<{
    landingPageConfig: any;
    landingPageHtml: string;
    customCss: string;
    customJs: string;
    slug: string;
  }> {
    const event = await this.eventRepository.findOne({
      where: { id },
      select: [
        'id',
        'landingPageConfig',
        'landingPageHtml',
        'customCss',
        'customJs',
        'slug',
      ],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return {
      landingPageConfig: event.landingPageConfig,
      landingPageHtml: event.landingPageHtml,
      customCss: event.customCss,
      customJs: event.customJs,
      slug: event.slug,
    };
  }

  async findBySlug(slug: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { slug },
      relations: ['organizer'],
      select: {
        organizer: {
          id: true,
          name: true,
          email: true,
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Only return published events for public access
    if (event.status !== EventStatus.PUBLISHED) {
      throw new NotFoundException('Event not available');
    }

    return event;
  }

  async previewLandingPage(
    id: string,
    previewData: UpdateEventLandingPageDto,
    userId: string,
  ): Promise<{
    event: Event;
    previewConfig: UpdateEventLandingPageDto;
  }> {
    const event = await this.findOne(id);

    // Check permissions
    if (event.organizerId !== userId) {
      throw new ForbiddenException('You can only preview your own events');
    }

    return {
      event,
      previewConfig: previewData,
    };
  }

  async generateSlugFromTitle(title: string): Promise<string> {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();

    let slug = baseSlug;
    let counter = 1;

    // Ensure slug uniqueness
    while (await this.eventRepository.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}
