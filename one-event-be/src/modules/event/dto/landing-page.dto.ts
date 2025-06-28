import {
  IsOptional,
  IsString,
  IsArray,
  IsUrl,
  IsHexColor,
  IsEnum,
  Length,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LandingPageThemeDto {
  @IsOptional()
  @IsHexColor()
  primaryColor?: string;

  @IsOptional()
  @IsHexColor()
  secondaryColor?: string;

  @IsOptional()
  @IsHexColor()
  backgroundColor?: string;

  @IsOptional()
  @IsHexColor()
  textColor?: string;

  @IsOptional()
  @IsString()
  fontFamily?: string;
}

export class LandingPageHeroDto {
  @IsOptional()
  @IsString()
  @Length(1, 200)
  title?: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  subtitle?: string;

  @IsOptional()
  @IsUrl()
  backgroundImage?: string;

  @IsOptional()
  @IsUrl()
  backgroundVideo?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  ctaText?: string;

  @IsOptional()
  @IsHexColor()
  ctaColor?: string;
}

export class CustomSectionDto {
  @IsString()
  @Length(1, 100)
  title: string;

  @IsString()
  @Length(1, 5000)
  content: string;

  @IsEnum(['text', 'image', 'video', 'html'])
  type: 'text' | 'image' | 'video' | 'html';

  @IsOptional()
  order?: number;
}

export class LandingPageSectionsDto {
  @IsOptional()
  showAbout?: boolean;

  @IsOptional()
  showAgenda?: boolean;

  @IsOptional()
  showSpeakers?: boolean;

  @IsOptional()
  showLocation?: boolean;

  @IsOptional()
  showPricing?: boolean;

  @IsOptional()
  showTestimonials?: boolean;

  @IsOptional()
  @IsArray()
  @Type(() => CustomSectionDto)
  customSections?: CustomSectionDto[];
}

export class SocialMediaDto {
  @IsOptional()
  @IsUrl()
  facebook?: string;

  @IsOptional()
  @IsUrl()
  twitter?: string;

  @IsOptional()
  @IsUrl()
  linkedin?: string;

  @IsOptional()
  @IsUrl()
  instagram?: string;
}

export class LandingPageContactDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @Type(() => SocialMediaDto)
  socialMedia?: SocialMediaDto;
}

export class LandingPageSeoDto {
  @IsOptional()
  @IsString()
  @Length(1, 60)
  title?: string;

  @IsOptional()
  @IsString()
  @Length(1, 160)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional()
  @IsUrl()
  ogImage?: string;
}

export class LandingPageConfigDto {
  @IsOptional()
  @Type(() => LandingPageThemeDto)
  theme?: LandingPageThemeDto;

  @IsOptional()
  @Type(() => LandingPageHeroDto)
  hero?: LandingPageHeroDto;

  @IsOptional()
  @Type(() => LandingPageSectionsDto)
  sections?: LandingPageSectionsDto;

  @IsOptional()
  @Type(() => LandingPageContactDto)
  contact?: LandingPageContactDto;

  @IsOptional()
  @Type(() => LandingPageSeoDto)
  seo?: LandingPageSeoDto;
}

export class UpdateEventLandingPageDto {
  @IsOptional()
  @IsString()
  landingPageHtml?: string;

  @IsOptional()
  @Type(() => LandingPageConfigDto)
  landingPageConfig?: LandingPageConfigDto;

  @IsOptional()
  @IsString()
  customCss?: string;

  @IsOptional()
  @IsString()
  customJs?: string;

  @IsOptional()
  @IsString()
  @Length(3, 100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug?: string;
}
