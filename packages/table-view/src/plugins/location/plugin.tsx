import { useEffect, useId, useRef, useState } from "react";

import { Icon } from "@notion-kit/icons";
import type { TablePropertySources } from "@notion-kit/table-hook";
import {
  locationLabel,
  locationValueSchema,
  type LocationPlugin,
  type LocationValue,
} from "@notion-kit/table-hook/plugins";
import {
  Button,
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxGroup,
  ComboboxItem,
  ComboboxList,
  Field,
  FieldLabel,
  Input,
  Separator,
} from "@notion-kit/ui/primitives";

import { useTableViewCtx } from "@/table-contexts";

import {
  PropertyCellValues,
  PropertyEditorCell,
  propertyMetadata,
  PropertySearch,
} from "../property-cell";
import type { TableUiPlugin } from "../registry";
import { createCellRenderer, type CellRendererProps } from "../renderers";
import { DefaultGroupingValue } from "../utils";

const emptyLocation: LocationValue = { name: "", address: "" };

type SearchLocations = NonNullable<TablePropertySources["searchLocations"]>;

interface PlaceSearchResponse {
  query: string;
  source: SearchLocations;
  places: LocationValue[];
  failed?: true;
}

function usePlaceSuggestions(searchLocations?: SearchLocations) {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<PlaceSearchResponse>();
  const searchQuery = query.trim();

  useEffect(() => {
    if (!searchLocations || !searchQuery) return;
    const request = new AbortController();
    const timer = setTimeout(() => {
      void loadPlaces(searchLocations, searchQuery, request.signal);
    }, 250);

    async function loadPlaces(
      source: SearchLocations,
      query: string,
      signal: AbortSignal,
    ) {
      try {
        const values = await source(query, signal);
        if (signal.aborted) return;
        const places = values.flatMap((value) => {
          const parsed = locationValueSchema.safeParse(value);
          return parsed.success && locationLabel(parsed.data)
            ? [parsed.data]
            : [];
        });
        setResponse({ source, query, places });
      } catch {
        if (!signal.aborted)
          setResponse({ source, query, places: [], failed: true });
      }
    }

    return () => {
      clearTimeout(timer);
      request.abort();
    };
  }, [searchLocations, searchQuery]);

  const active =
    response?.query === searchQuery && response.source === searchLocations
      ? response
      : undefined;
  return {
    query,
    searchQuery,
    setQuery: (next: string) => {
      if (next.trim() !== searchQuery) setResponse(undefined);
      setQuery(next);
    },
    suggestions: active?.places ?? [],
    searching: Boolean(searchLocations && searchQuery && !active),
    failed: Boolean(active?.failed),
  };
}

function MatchedPlaceText({ text, query }: { text: string; query: string }) {
  const index = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (index < 0) return text;

  const end = index + query.length;
  return (
    <>
      {text.slice(0, index)}
      <strong className="font-semibold">{text.slice(index, end)}</strong>
      {text.slice(end)}
    </>
  );
}

function locationMapUrl(location: LocationValue) {
  const query = location.coordinates
    ? `${location.coordinates.latitude},${location.coordinates.longitude}`
    : [location.name, location.address].filter(Boolean).join(" ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function LocationEditor({
  value,
  onSave,
  onClose,
}: {
  value: LocationValue | null;
  onSave: (value: LocationValue | null) => void;
  onClose: () => void;
}) {
  const { propertySources } = useTableViewCtx();
  const { searchLocations, reverseGeocode } = propertySources ?? {};
  const { query, searchQuery, setQuery, suggestions, searching, failed } =
    usePlaceSuggestions(searchLocations);
  const [draft, setDraft] = useState<LocationValue | null>(null);
  const [locationStatus, setLocationStatus] = useState("");
  const geolocationRequest = useRef<AbortController | null>(null);
  const nameId = useId();
  const addressId = useId();

  useEffect(() => () => geolocationRequest.current?.abort(), []);
  const noSuggestions = Boolean(
    searchQuery && !searching && suggestions.length === 0,
  );
  const searchStatus = searching
    ? "Loading..."
    : searchQuery && (failed || !searchLocations)
      ? "Place search is unavailable."
      : noSuggestions
        ? "No places found."
        : "";

  const save = (location: LocationValue | null) => {
    geolocationRequest.current?.abort();
    onSave(location);
  };
  const locate = () => {
    setLocationStatus("Getting your location…");
    geolocationRequest.current?.abort();
    const request = new AbortController();
    geolocationRequest.current = request;
    const browser: { geolocation?: Geolocation } = navigator;
    if (!browser.geolocation) {
      setLocationStatus("Current location is unavailable.");
      return;
    }
    browser.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        if (request.signal.aborted) return;
        const coordinates = { latitude, longitude };
        const coordinateLocation = { ...emptyLocation, coordinates };
        if (!reverseGeocode) {
          save(coordinateLocation);
          return;
        }
        void reverseGeocode(coordinates, request.signal)
          .catch(() => null)
          .then((result) => {
            if (request.signal.aborted) return;
            const parsed = locationValueSchema.safeParse(result);
            save(
              parsed.success
                ? { ...parsed.data, coordinates }
                : coordinateLocation,
            );
          });
      },
      () => {
        if (!request.signal.aborted)
          setLocationStatus("Could not access your location.");
      },
      { timeout: 10_000 },
    );
  };
  const items = [
    { id: "current", label: "Current Location", location: null },
    ...suggestions.map((location, index) => ({
      id: String(index),
      label: locationLabel(location),
      location,
    })),
  ];
  return (
    <>
      <Combobox
        inline
        open
        filter={null}
        items={Combobox.createItems(items, {
          getValue: ({ id }) => id,
          getLabel: ({ label }) => label,
        })}
        value={null}
        inputValue={query}
        onInputValueChange={(value, { reason }) => {
          if (reason !== "input-change" && reason !== "input-clear") return;
          geolocationRequest.current?.abort();
          setQuery(value);
          setLocationStatus("");
        }}
        onValueChange={(id) => {
          const option = items.find((item) => item.id === id);
          if (!option) return;
          if (option.location) {
            save(option.location);
          } else {
            locate();
          }
        }}
      >
        <PropertySearch
          label="Search places"
          placeholder="Search for a location..."
          onClose={() => {
            geolocationRequest.current?.abort();
            onClose();
          }}
        />
        <ComboboxContent variant="inline">
          <ComboboxList>
            <ComboboxGroup>
              <ComboboxCollection>
                {(item: (typeof items)[number]) => {
                  const address = item.location?.address.trim();
                  const detail =
                    address && address !== item.label ? address : undefined;
                  return (
                    <ComboboxItem
                      key={item.id}
                      value={item.id}
                      aria-label={
                        detail ? `${item.label}, ${detail}` : item.label
                      }
                      label={
                        <>
                          <div className="truncate">
                            <MatchedPlaceText
                              text={item.label}
                              query={item.location ? searchQuery : ""}
                            />
                          </div>
                          {detail && (
                            <div className="truncate text-xs text-secondary">
                              {detail}
                            </div>
                          )}
                        </>
                      }
                      icon={item.location ? undefined : <Icon.Locate />}
                      showIndicator={false}
                    />
                  );
                }}
              </ComboboxCollection>
            </ComboboxGroup>
          </ComboboxList>
          {(locationStatus || searchStatus) && (
            <p role="status" className="px-3 pb-2 text-sm text-muted">
              {locationStatus || searchStatus}
            </p>
          )}
        </ComboboxContent>
      </Combobox>
      {searchQuery && (
        <footer className="border-t border-border px-3 py-2 text-xs text-secondary">
          Results may be limited.{" "}
          <a
            className="underline"
            href="https://www.notion.com/help/maps"
            target="_blank"
            rel="noreferrer"
          >
            Learn more
          </a>
          .
        </footer>
      )}
      {(noSuggestions || draft !== null || value !== null) && (
        <>
          <Separator />
          <div className="flex flex-col gap-2 p-2">
            {noSuggestions && !draft && (
              <Button
                variant="hint"
                onClick={() => {
                  geolocationRequest.current?.abort();
                  setLocationStatus("");
                  setDraft({ name: "", address: searchQuery });
                }}
              >
                Enter address manually
              </Button>
            )}
            {draft && (
              <>
                <Field>
                  <FieldLabel htmlFor={nameId}>Place name</FieldLabel>
                  <Input
                    id={nameId}
                    value={draft.name}
                    onChange={(event) => {
                      geolocationRequest.current?.abort();
                      setDraft({ ...draft, name: event.currentTarget.value });
                    }}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={addressId}>Address</FieldLabel>
                  <Input
                    id={addressId}
                    value={draft.address}
                    onChange={(event) => {
                      geolocationRequest.current?.abort();
                      setDraft({
                        ...draft,
                        address: event.currentTarget.value,
                      });
                    }}
                  />
                </Field>
                <Button
                  onClick={() =>
                    save({
                      ...draft,
                      name: draft.name.trim(),
                      address: draft.address.trim(),
                    })
                  }
                  disabled={!locationLabel(draft)}
                >
                  Save place
                </Button>
              </>
            )}
            {value && (
              <div className="flex items-center justify-between gap-2">
                {locationLabel(value) && (
                  <a
                    className="text-sm underline"
                    href={locationMapUrl(value)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in maps
                  </a>
                )}
                <Button variant="hint" onClick={() => save(null)}>
                  Clear
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

function LocationCell(props: CellRendererProps<LocationValue | null>) {
  return (
    <PropertyEditorCell
      cell={props}
      isEmpty={!props.textValue}
      value={
        <PropertyCellValues wrapped={props.wrapped}>
          <span className={props.wrapped ? "wrap-break-word" : "truncate"}>
            {props.textValue}
          </span>
        </PropertyCellValues>
      }
      renderEditor={(close) => (
        <LocationEditor
          value={props.data}
          onClose={close}
          onSave={(value) => {
            props.onChange(value);
            close();
          }}
        />
      )}
    />
  );
}

export function location(): TableUiPlugin<LocationPlugin> {
  return {
    id: "location",
    ...propertyMetadata(
      "location",
      "Place",
      "Stores a place name, address, or your current location.",
    ),
    renderCell: createCellRenderer<LocationPlugin>((props) => (
      <LocationCell {...props} />
    )),
    renderGroupingValue: DefaultGroupingValue,
  };
}
