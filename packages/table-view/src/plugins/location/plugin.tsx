import { useEffect, useId, useRef, useState } from "react";

import { Icon } from "@notion-kit/icons";
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
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  Field,
  FieldLabel,
  Input,
  Separator,
  TooltipPreset,
} from "@notion-kit/ui/primitives";

import { useTableViewCtx } from "@/table-contexts";

import { PropertyCell, propertyMetadata } from "../property-cell";
import type { TableUiPlugin } from "../registry";
import { createCellRenderer, type CellRendererProps } from "../renderers";
import { DefaultGroupingValue } from "../utils";

const emptyLocation: LocationValue = { name: "", address: "" };
function locationMapUrl(location: LocationValue) {
  const query = location.coordinates
    ? `${location.coordinates.latitude},${location.coordinates.longitude}`
    : [location.name, location.address].filter(Boolean).join(" ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function LocationEditor({
  value,
  onSave,
}: {
  value: LocationValue | null;
  onSave: (value: LocationValue | null) => void;
}) {
  const { propertySources } = useTableViewCtx();
  const { searchLocations, reverseGeocode } = propertySources ?? {};
  const [draft, setDraft] = useState(value ?? emptyLocation);
  const [manual, setManual] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [results, setResults] = useState<LocationValue[]>([]);
  const [searching, setSearching] = useState(false);
  const geolocationRequest = useRef<AbortController | null>(null);
  const nameId = useId();
  const addressId = useId();

  useEffect(() => {
    if (!searchLocations || !query.trim()) return;
    const request = new AbortController();
    const timeout = setTimeout(() => {
      setSearching(true);
      void searchLocations(query.trim(), request.signal)
        .then((locations) => {
          if (request.signal.aborted) return;
          setResults(
            locations.flatMap((location) => {
              const result = locationValueSchema.safeParse(location);
              return result.success ? [result.data] : [];
            }),
          );
        })
        .catch(() => {
          if (!request.signal.aborted)
            setStatus("Place search is unavailable. You can enter an address.");
        })
        .finally(() => {
          if (!request.signal.aborted) setSearching(false);
        });
    }, 250);
    return () => {
      clearTimeout(timeout);
      request.abort();
    };
  }, [query, searchLocations]);

  useEffect(() => () => geolocationRequest.current?.abort(), []);
  const locate = () => {
    setStatus("Getting your location…");
    geolocationRequest.current?.abort();
    const request = new AbortController();
    geolocationRequest.current = request;
    const browser: { geolocation?: Geolocation } = navigator;
    if (!browser.geolocation) {
      setStatus("Current location is unavailable.");
      return;
    }
    browser.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        if (request.signal.aborted) return;
        const coordinates = { latitude, longitude };
        const coordinateLocation = { ...emptyLocation, coordinates };
        if (!reverseGeocode) {
          onSave(coordinateLocation);
          return;
        }
        void reverseGeocode(coordinates, request.signal)
          .catch(() => null)
          .then((result) => {
            if (request.signal.aborted) return;
            const parsed = locationValueSchema.safeParse(result);
            onSave(
              parsed.success
                ? { ...parsed.data, coordinates }
                : coordinateLocation,
            );
          });
      },
      () => {
        if (!request.signal.aborted)
          setStatus("Could not access your location.");
      },
      { timeout: 10_000 },
    );
  };
  const items = [
    { id: "current", label: "Current Location", location: null },
    ...results.map((location, index) => ({
      id: String(index),
      label: locationLabel(location),
      location,
    })),
  ];
  return (
    <div className="flex flex-col gap-2">
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
          setResults([]);
          setSearching(Boolean(searchLocations && value.trim()));
          setStatus("");
        }}
        onValueChange={(id) => {
          const option = items.find((item) => item.id === id);
          if (!option) return;
          if (option.location) {
            onSave(option.location);
          } else {
            locate();
          }
        }}
      >
        <div className="flex items-center gap-2">
          <Icon.MagnifyingGlass className="size-4 shrink-0 fill-icon" />
          <ComboboxInput
            aria-label="Search places"
            placeholder="Search a name or address"
          />
          <TooltipPreset description="Place search coverage depends on the location provider.">
            <Button variant="hint" aria-label="About place search">
              <Icon.Info />
            </Button>
          </TooltipPreset>
        </div>
        <ComboboxContent variant="inline">
          <ComboboxList>
            <ComboboxGroup>
              <ComboboxCollection>
                {(item: (typeof items)[number]) => (
                  <ComboboxItem
                    key={item.id}
                    value={item.id}
                    label={item.label}
                    icon={item.location ? undefined : <Icon.MapPinPlusSmall />}
                    desc={
                      item.location?.name ? item.location.address : undefined
                    }
                    showIndicator={false}
                  />
                )}
              </ComboboxCollection>
            </ComboboxGroup>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {(status ||
        searching ||
        (searchLocations && query.trim() && results.length === 0)) && (
        <p role="status" className="text-sm text-muted">
          {status || (searching ? "Searching…" : "No places found")}
        </p>
      )}
      <Separator />
      {!manual && (
        <Button
          variant="hint"
          onClick={() => {
            geolocationRequest.current?.abort();
            setStatus("");
            setDraft(value ?? { ...emptyLocation, address: query.trim() });
            setManual(true);
          }}
        >
          Enter address manually
        </Button>
      )}
      {manual && (
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
                  coordinates: undefined,
                });
              }}
            />
          </Field>
          <Button
            onClick={() =>
              onSave({
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
          <Button variant="hint" onClick={() => onSave(null)}>
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}

function LocationCell(props: CellRendererProps<LocationValue | null>) {
  return (
    <PropertyCell
      cell={props}
      text={props.textValue}
      renderEditor={(close) => (
        <LocationEditor
          value={props.data}
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
