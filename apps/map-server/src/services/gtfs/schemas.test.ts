import { describe, expect, it } from "vitest";

import {
  agencyFileSchema,
  calendarFileSchema,
  routeFileSchema,
  stopFileSchema,
} from "./schemas";

describe("GTFS static file schemas", () => {
  it("accepts optional null fields from a previous parse pass", () => {
    const agency = agencyFileSchema.parse({
      agency_id: "BKK",
      agency_name: "BKK",
      agency_url: "http://www.bkk.hu",
      agency_timezone: "Europe/Budapest",
      agency_lang: "hu",
      agency_phone: "+36 1 3 255 255",
      agency_fare_url: "",
      agency_email: "",
      cemv_support: "",
    });

    expect(agencyFileSchema.parse(agency)).toMatchObject({
      agency_id: "BKK",
      agency_fare_url: null,
      agency_email: null,
      cemv_support: null,
    });
  });

  it("accepts numeric and boolean fields from a previous parse pass", () => {
    const stop = stopFileSchema.parse({
      stop_id: "F04181",
      stop_name: "Soroksar, Molnar-sziget",
      stop_lat: "47.400162",
      stop_lon: "19.114632",
      location_type: "0",
      wheelchair_boarding: "1",
    });
    const route = routeFileSchema.parse({
      route_id: "0050",
      agency_id: "BKK",
      route_short_name: "5",
      route_type: "3",
      route_sort_order: "20",
      route_color: "009EE3",
      route_text_color: "FFFFFF",
    });
    const calendar = calendarFileSchema.parse({
      service_id: "weekday",
      monday: "1",
      tuesday: "1",
      wednesday: "1",
      thursday: "1",
      friday: "1",
      saturday: "0",
      sunday: "0",
      start_date: "20260501",
      end_date: "20260531",
    });

    expect(stopFileSchema.parse(stop)).toMatchObject({
      stop_lat: 47.400162,
      stop_lon: 19.114632,
      location_type: 0,
      wheelchair_boarding: 1,
    });
    expect(routeFileSchema.parse(route)).toMatchObject({
      route_type: 3,
      route_sort_order: 20,
    });
    expect(calendarFileSchema.parse(calendar)).toMatchObject({
      monday: true,
      saturday: false,
    });
  });
});
