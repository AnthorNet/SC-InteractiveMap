export type GameSave = {
  header: Header;
  PACKAGE_FILE_TAG: number;
  maxChunkSize: number;
  objects: Record<GameObject["pathName"], GameObject>;
  collectables: GameObjectProperty[];
  gameStatePathName: GameObject["pathName"];
  playerHostPathName: GameObject["pathName"];
};

type Header = HeaderV6 | HeaderV7 | HeaderV8;

type HeaderV6 = {
  saveHeaderType: ParsedInt;
  saveVersion: ParsedInt;
  buildVersion: ParsedInt;
  mapName: ParsedString;
  mapOptions: ParsedString;
  sessionName: ParsedString;
  playDurationSeconds: ParsedInt;
  saveDateTime: ParsedLong;
  sessionVisibility: ParsedByte;
};

type HeaderV7 = HeaderV7 & {
  fEditorObjectVersion: ParsedInt;
};

type HeaderV8 = HeaderV7 & {
  modMetadata: ParsedString;
  isModdedSave: ParsedInt;
};

export type DefaultValues = Readonly<{
  rotation: [number, number, number, number];
  translation: [number, number, number];
  mPrimaryColor: {
    name: string;
    type: string;
    value: {
      type: string;
      values: {
        a: number;
        b: number;
        g: number;
        r: number;
      };
    };
  };
  mSecondaryColor: {
    name: string;
    type: string;
    value: {
      type: string;
      values: {
        a: number;
        b: number;
        g: number;
        r: number;
      };
    };
  };
}>;

export type ParsedByte = number;

export type ParsedDouble = number;

export type ParsedFloat = number;

export type ParsedHex = string;

export type ParsedInt = number;

export type ParsedInt8 = number;

export type ParsedLong = number | [number, number];

export type ParsedString = string;

export type ParsedFINGPUT1BufferPixel = {
  character: ParsedHex;
  foregroundColor: {
    r: ParsedFloat;
    g: ParsedFloat;
    b: ParsedFloat;
    a: ParsedFloat;
  };
  backgroundColor: {
    r: ParsedFloat;
    g: ParsedFloat;
    b: ParsedFloat;
    a: ParsedFloat;
  };
};

// TODO: these types properly.
type GameObject = Record<string, any>;
type GameObjectProperty = Record<string, any>;

type MessageToUser = {
  message: string;
  messageReplace?: string | string[];
};

export type Reporter = {
  reportProgress(data: { progress: number } | MessageToUser);
  reportFailure(data?: MessageToUser);
};
