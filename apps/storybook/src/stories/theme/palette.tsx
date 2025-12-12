import { ColorGroup, ColorPalette } from "./color-palette";

export function LightColorPalette() {
  return (
    <ColorPalette theme="light">
      <ColorGroup
        title="Pal Ui Blue"
        prefix="--palUiBlu"
        colors={{
          50: "rgba(35,131,226,.035)",
          75: "#2383e20d",
          100: "#2383e212",
          200: "#2383e224",
          300: "#2383e236",
          400: "#2383e259",
          500: "#2383e291",
          600: "#2383e2",
          700: "#105fad",
        }}
      />
      <ColorGroup
        title="Pal Pink"
        prefix="--palPin"
        colors={{
          30: "#e793bc12",
          50: "#fcf1f6",
          100: "#e188b345",
          200: "#cc5c9266",
          300: "#d15b94a6",
          400: "#c4548ad1",
          500: "#c14c8a",
          600: "#a2336f",
          700: "#6f3151",
          800: "#4c2337",
          900: "#2c1420",
        }}
      />
      <ColorGroup
        title="Pal Purple"
        prefix="--palPur"
        colors={{
          30: "#ceafe512",
          50: "#f8f3fc",
          100: "#a881c545",
          200: "#8d62ae66",
          300: "#9a72b9a6",
          400: "#9467b6d1",
          500: "#9065b0",
          600: "#754d92",
          700: "#5a3872",
          800: "#412454",
          900: "#26152e",
        }}
      />
      <ColorGroup
        title="Pal Green"
        prefix="--palGre"
        colors={{
          30: "#7bb78112",
          50: "#edf3ec",
          100: "#7bb78145",
          200: "#50906766",
          300: "#509067a6",
          400: "#42855ad1",
          500: "#448361",
          600: "#33684e",
          700: "#1f4f3b",
          800: "#1c3829",
          900: "#102416",
        }}
      />
      <ColorGroup
        title="Pal Gray"
        prefix="--palGra"
        colors={{
          0: "#ffffff",
          30: "#5448310a",
          50: "#f8f8f7",
          75: "#54483114",
          90: "#e3e2e0b3",
          100: "#54483126",
          200: "#51493c52",
          300: "#46444073",
          400: "#47464499",
          500: "#73726e",
          600: "#5f5e5b",
          700: "#484743",
          800: "#32302c",
          900: "#1d1b16",
        }}
      />
      <ColorGroup
        title="Pal Transparent Gray"
        prefix="--palTraGra"
        colors={{
          30: "#00000003",
          50: "#0000000a",
          75: "#0000000d",
          100: "#0000000f",
          200: "#00000012",
          300: "#0000001c",
          400: "rgba(0,0,0,.155)",
          500: "rgba(0,0,0,.335)",
          600: "#00000075",
          700: "#0000009e",
          800: "rgba(0,0,0,.815)",
          850: "#000000e3",
          900: "rgba(0,0,0,.988)",
        }}
      />
      <ColorGroup
        title="Pal Orange"
        prefix="--palOra"
        colors={{
          30: "#e07c3912",
          50: "#fbecdd",
          100: "#e07c3945",
          200: "#d95f0d66",
          300: "#d95f0da6",
          400: "#d95f0dd1",
          500: "#d9730d",
          600: "#8d4e17",
          700: "#6a3b12",
          800: "#49290e",
          900: "#281809",
        }}
      />
      <ColorGroup
        title="Pal Brown"
        prefix="--palBro"
        colors={{
          30: "#d2a28d12",
          50: "#f4eeee",
          100: "#d2a28d59",
          200: "#9c4c2852",
          300: "#9c4c2880",
          400: "#9c4c28ad",
          500: "#9f6b53",
          600: "#80543f",
          700: "#613e2e",
          800: "#442a1e",
          900: "#2d1506",
        }}
      />
      <ColorGroup
        title="Pal Red"
        prefix="--palRed"
        colors={{
          30: "#f3887612",
          50: "#fdebec",
          100: "#f4ab9f66",
          200: "#d7261552",
          300: "#d7261580",
          400: "#d72615ad",
          500: "#cd3c3a",
          600: "#ae2f2e",
          700: "#862120",
          800: "#5d1715",
          900: "#30130f",
        }}
      />
      <ColorGroup
        title="Pal Yellow"
        prefix="--palYel"
        colors={{
          30: "#d7b11812",
          50: "#fbf3db",
          100: "#ecbf4263",
          200: "#e5af198c",
          300: "#d79609bf",
          400: "#c07d00d1",
          500: "#cb912f",
          600: "#835e33",
          700: "#5f4023",
          800: "#402c1b",
          900: "#251910",
        }}
      />
      <ColorGroup
        title="Pal Blue"
        prefix="--palBlu"
        colors={{
          30: "#5ba6d112",
          50: "#e7f3f8",
          100: "#5da5ce45",
          200: "#3987b866",
          300: "#3f89b8a6",
          400: "#3681b1d1",
          500: "#337ea9",
          600: "#2d6387",
          700: "#1f4a68",
          800: "#183347",
          900: "#0c1d2b",
        }}
      />
      {/* Other colors */}
      <ColorGroup
        title="Text"
        prefix="--tex"
        colors={{
          Qua: "#51493c52",
          UiRedSec: "#d7261580",
          Pri: "#2c2c2b",
          Sec: "#86837e",
          Ter: "#a8a49c",
          Dis: "#d4d3cf",
          AccPri: "#8e8b86",
          InvPri: "#f0efed",
          InvSec: "#a8a49c",
        }}
      />
      <ColorGroup
        title="Icon"
        prefix="--ico"
        colors={{
          Pri: "#494846",
          Sec: "#8e8b86",
          Ter: "#a8a49c",
          Dis: "#d4d3cf",
          AccPri: "#5f5e59",
          InvPri: "#f0efed",
          InvSec: "#a8a49c",
        }}
      />
    </ColorPalette>
  );
}

export function DarkColorPalette() {
  return <ColorPalette theme="dark"></ColorPalette>;
}
