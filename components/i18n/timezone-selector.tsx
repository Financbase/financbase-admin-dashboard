"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Clock, Search, Check } from 'lucide-react';
import { locales, timezones, type Locale } from '@/lib/i18n/config';

interface TimezoneSelectorProps {
  className?: string;
  currentTimezone?: string;
  onTimezoneChange?: (timezone: string) => void;
  showSearch?: boolean;
  variant?: 'default' | 'compact' | 'minimal';
}

const commonTimezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Rome',
  'Europe/Madrid',
  'Europe/Amsterdam',
  'Europe/Stockholm',
  'Europe/Copenhagen',
  'Europe/Oslo',
  'Europe/Helsinki',
  'Europe/Warsaw',
  'Europe/Prague',
  'Europe/Budapest',
  'Europe/Vienna',
  'Europe/Zurich',
  'Europe/Athens',
  'Europe/Istanbul',
  'Europe/Moscow',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Singapore',
  'Asia/Seoul',
  'Asia/Taipei',
  'Asia/Bangkok',
  'Asia/Jakarta',
  'Asia/Manila',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Tehran',
  'Asia/Karachi',
  'Asia/Dhaka',
  'Asia/Kathmandu',
  'Asia/Colombo',
  'Asia/Kabul',
  'Asia/Almaty',
  'Asia/Tashkent',
  'Asia/Bishkek',
  'Asia/Dushanbe',
  'Asia/Ashgabat',
  'Asia/Tbilisi',
  'Asia/Yerevan',
  'Asia/Baku',
  'Asia/Yekaterinburg',
  'Asia/Omsk',
  'Asia/Novosibirsk',
  'Asia/Krasnoyarsk',
  'Asia/Irkutsk',
  'Asia/Yakutsk',
  'Asia/Vladivostok',
  'Asia/Magadan',
  'Asia/Kamchatka',
  'Asia/Anadyr',
  'Pacific/Auckland',
  'Pacific/Fiji',
  'Pacific/Honolulu',
  'Pacific/Guam',
  'Pacific/Port_Moresby',
  'Pacific/Noumea',
  'Pacific/Tahiti',
  'Pacific/Marquesas',
  'Pacific/Gambier',
  'Pacific/Pitcairn',
  'Pacific/Easter',
  'Pacific/Galapagos',
  'Pacific/Cocos',
  'Pacific/Christmas',
  'Pacific/Norfolk',
  'Pacific/Chatham',
  'Pacific/Kiritimati',
  'Pacific/Tongatapu',
  'Pacific/Apia',
  'Pacific/Niue',
  'Pacific/Rarotonga',
  'Pacific/Tarawa',
  'Pacific/Funafuti',
  'Pacific/Wallis',
  'Pacific/Palau',
  'Pacific/Yap',
  'Pacific/Chuuk',
  'Pacific/Pohnpei',
  'Pacific/Kosrae',
  'Pacific/Majuro',
  'Pacific/Kwajalein',
  'Pacific/Wake',
  'Pacific/Midway',
  'Pacific/Johnston',
  'Pacific/Baker',
  'Pacific/Howland',
  'Pacific/Jarvis',
  'Pacific/Kingman',
  'Pacific/Palmyra',
  'Pacific/Tokelau',
  'Pacific/Wake',
  'Pacific/Midway',
  'Pacific/Johnston',
  'Pacific/Baker',
  'Pacific/Howland',
  'Pacific/Jarvis',
  'Pacific/Kingman',
  'Pacific/Palmyra',
  'Pacific/Tokelau',
  'Atlantic/Azores',
  'Atlantic/Bermuda',
  'Atlantic/Canary',
  'Atlantic/Cape_Verde',
  'Atlantic/Faroe',
  'Atlantic/Madeira',
  'Atlantic/Reykjavik',
  'Atlantic/South_Georgia',
  'Atlantic/St_Helena',
  'Atlantic/Stanley',
  'Indian/Antananarivo',
  'Indian/Chagos',
  'Indian/Christmas',
  'Indian/Cocos',
  'Indian/Comoro',
  'Indian/Kerguelen',
  'Indian/Mahe',
  'Indian/Maldives',
  'Indian/Mauritius',
  'Indian/Mayotte',
  'Indian/Reunion',
  'Indian/Seychelles',
  'Indian/Chagos',
  'Indian/Christmas',
  'Indian/Cocos',
  'Indian/Comoro',
  'Indian/Kerguelen',
  'Indian/Mahe',
  'Indian/Maldives',
  'Indian/Mauritius',
  'Indian/Mayotte',
  'Indian/Reunion',
  'Indian/Seychelles',
  'Africa/Abidjan',
  'Africa/Accra',
  'Africa/Addis_Ababa',
  'Africa/Algiers',
  'Africa/Asmara',
  'Africa/Bamako',
  'Africa/Bangui',
  'Africa/Banjul',
  'Africa/Bissau',
  'Africa/Blantyre',
  'Africa/Brazzaville',
  'Africa/Bujumbura',
  'Africa/Cairo',
  'Africa/Casablanca',
  'Africa/Ceuta',
  'Africa/Conakry',
  'Africa/Dakar',
  'Africa/Dar_es_Salaam',
  'Africa/Djibouti',
  'Africa/Douala',
  'Africa/El_Aaiun',
  'Africa/Freetown',
  'Africa/Gaborone',
  'Africa/Harare',
  'Africa/Johannesburg',
  'Africa/Juba',
  'Africa/Kampala',
  'Africa/Khartoum',
  'Africa/Kigali',
  'Africa/Kinshasa',
  'Africa/Lagos',
  'Africa/Libreville',
  'Africa/Lome',
  'Africa/Luanda',
  'Africa/Lubumbashi',
  'Africa/Lusaka',
  'Africa/Malabo',
  'Africa/Maputo',
  'Africa/Maseru',
  'Africa/Mbabane',
  'Africa/Mogadishu',
  'Africa/Monrovia',
  'Africa/Nairobi',
  'Africa/Ndjamena',
  'Africa/Niamey',
  'Africa/Nouakchott',
  'Africa/Ouagadougou',
  'Africa/Porto-Novo',
  'Africa/Sao_Tome',
  'Africa/Tripoli',
  'Africa/Tunis',
  'Africa/Windhoek'
];

export function TimezoneSelector({ 
  className, 
  currentTimezone = 'UTC',
  onTimezoneChange,
  showSearch = true,
  variant = 'default' 
}: TimezoneSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTimezones = commonTimezones.filter(timezone =>
    timezone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTimezoneChange = (timezone: string) => {
    onTimezoneChange?.(timezone);
    setIsOpen(false);
  };

  const formatTimezoneName = (timezone: string) => {
    return timezone.replace(/_/g, ' ').replace(/\//g, ' / ');
  };

  if (variant === 'minimal') {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={cn('h-8 w-8 p-0', className)}>
            <Clock className="h-4 w-4" />
            <span className="sr-only">Change timezone</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          {filteredTimezones.slice(0, 10).map((timezone) => (
            <DropdownMenuItem
              key={timezone}
              onClick={() => handleTimezoneChange(timezone)}
              className="flex items-center gap-2"
            >
              <span className="flex-1">{formatTimezoneName(timezone)}</span>
              {timezone === currentTimezone && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === 'compact') {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={cn('gap-2', className)}>
            <Clock className="h-4 w-4" />
            <span className="text-sm">{currentTimezone}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          {filteredTimezones.slice(0, 10).map((timezone) => (
            <DropdownMenuItem
              key={timezone}
              onClick={() => handleTimezoneChange(timezone)}
              className="flex items-center gap-2"
            >
              <span className="flex-1">{formatTimezoneName(timezone)}</span>
              {timezone === currentTimezone && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn('gap-2', className)}>
          <Clock className="h-4 w-4" />
          <span>{currentTimezone}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
          Select Timezone
        </div>
        {showSearch && (
          <div className="px-2 py-1.5">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search timezones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        )}
        <div className="max-h-60 overflow-y-auto">
          {filteredTimezones.map((timezone) => (
            <DropdownMenuItem
              key={timezone}
              onClick={() => handleTimezoneChange(timezone)}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="flex-1">
                <div className="font-medium">{formatTimezoneName(timezone)}</div>
                <div className="text-xs text-muted-foreground">
                  {timezone}
                </div>
              </div>
              {timezone === currentTimezone && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
