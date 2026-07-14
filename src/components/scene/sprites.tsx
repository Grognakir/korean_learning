import type { ReactNode } from "react";
import type { SpriteId } from "@/lib/scene/types";

const ink = "var(--ink-soft)";
const accent = "var(--accent)";
const accent2 = "var(--accent-2)";

function BuildingBody({
  fill,
  children,
}: {
  fill: string;
  children?: ReactNode;
}) {
  return (
    <g>
      <rect x="8" y="18" width="84" height="70" rx="4" fill={fill} stroke={ink} strokeWidth="2" />
      <polygon points="8,18 50,4 92,18" fill="#f3e6d8" stroke={ink} strokeWidth="2" />
      <rect x="22" y="48" width="16" height="22" rx="1" fill="#cfe7df" stroke={ink} strokeWidth="1.5" />
      <rect x="62" y="48" width="16" height="22" rx="1" fill="#cfe7df" stroke={ink} strokeWidth="1.5" />
      <rect x="42" y="58" width="16" height="30" rx="1" fill="#8d6a4a" stroke={ink} strokeWidth="1.5" />
      {children}
    </g>
  );
}

function schoolSprite() {
  return (
    <BuildingBody fill="#d8efe9">
      <text x="50" y="40" textAnchor="middle" fontSize="14" fontWeight="700" fill={accent}>
        學
      </text>
    </BuildingBody>
  );
}

function hospitalSprite() {
  return (
    <BuildingBody fill="#f2d9d9">
      <rect x="44" y="28" width="12" height="28" rx="1" fill="#b91c1c" />
      <rect x="36" y="36" width="28" height="12" rx="1" fill="#b91c1c" />
    </BuildingBody>
  );
}

function bankSprite() {
  return (
    <BuildingBody fill="#e8dfd0">
      <text x="50" y="42" textAnchor="middle" fontSize="18" fontWeight="700" fill={accent2}>
        ₩
      </text>
    </BuildingBody>
  );
}

function pharmacySprite() {
  return (
    <BuildingBody fill="#dff0e4">
      <circle cx="50" cy="36" r="10" fill="#166534" />
      <text x="50" y="40" textAnchor="middle" fontSize="12" fill="#fffaf4" fontWeight="700">
        Rx
      </text>
    </BuildingBody>
  );
}

function bookstoreSprite() {
  return (
    <BuildingBody fill="#efe4d2">
      <rect x="34" y="30" width="10" height="16" fill="#0f6b5c" />
      <rect x="46" y="30" width="10" height="16" fill="#c45c26" />
      <rect x="58" y="30" width="10" height="16" fill="#3d564b" />
    </BuildingBody>
  );
}

function convenienceSprite() {
  return (
    <BuildingBody fill="#fff6eb">
      <text x="50" y="42" textAnchor="middle" fontSize="13" fontWeight="700" fill={accent}>
        24h
      </text>
    </BuildingBody>
  );
}

function restaurantSprite() {
  return (
    <BuildingBody fill="#f7e3d0">
      <ellipse cx="50" cy="36" rx="14" ry="6" fill="#fffaf4" stroke={ink} />
      <rect x="48" y="36" width="4" height="12" fill={ink} />
    </BuildingBody>
  );
}

function cafeSprite() {
  return (
    <BuildingBody fill="#f3dcc8">
      <path
        d="M38 40 h22 a8 8 0 0 0 0 -16 h-22 z"
        fill="#fffaf4"
        stroke={ink}
        strokeWidth="1.5"
      />
      <path d="M60 28 c8 2 8 10 0 12" fill="none" stroke={ink} strokeWidth="1.5" />
      <path d="M44 20 c2 -4 6 -4 8 0" fill="none" stroke={accent2} strokeWidth="1.5" />
    </BuildingBody>
  );
}

function houseSprite() {
  return (
    <g>
      <rect x="12" y="36" width="76" height="50" rx="3" fill="#fff6eb" stroke={ink} strokeWidth="2" />
      <polygon points="12,36 50,10 88,36" fill="#c45c26" stroke={ink} strokeWidth="2" />
      <rect x="42" y="54" width="16" height="32" fill="#8d6a4a" stroke={ink} />
      <rect x="24" y="48" width="14" height="14" fill="#cfe7df" stroke={ink} />
      <rect x="62" y="48" width="14" height="14" fill="#cfe7df" stroke={ink} />
    </g>
  );
}

function treeSprite() {
  return (
    <g>
      <rect x="46" y="58" width="8" height="28" fill="#8d6a4a" />
      <circle cx="50" cy="42" r="22" fill="#5f8f62" />
      <circle cx="36" cy="48" r="14" fill="#6fa073" />
      <circle cx="64" cy="48" r="14" fill="#6fa073" />
    </g>
  );
}

function roadSprite() {
  return (
    <g>
      <rect x="0" y="35" width="100" height="30" fill="#5a5a5a" />
      <rect x="10" y="48" width="16" height="4" fill="#f5f0a8" />
      <rect x="42" y="48" width="16" height="4" fill="#f5f0a8" />
      <rect x="74" y="48" width="16" height="4" fill="#f5f0a8" />
    </g>
  );
}

function personSprite(shirt: string) {
  return (
    <g>
      <circle cx="50" cy="28" r="12" fill="#f3dcc8" stroke={ink} strokeWidth="1.5" />
      <path
        d="M28 78 C28 52 72 52 72 78"
        fill={shirt}
        stroke={ink}
        strokeWidth="1.5"
      />
      <rect x="34" y="78" width="10" height="16" rx="2" fill="#3d564b" />
      <rect x="56" y="78" width="10" height="16" rx="2" fill="#3d564b" />
    </g>
  );
}

function deskSprite() {
  return (
    <g>
      <rect x="12" y="40" width="76" height="12" rx="2" fill="#c4a574" stroke={ink} />
      <rect x="18" y="52" width="8" height="28" fill="#8d6a4a" />
      <rect x="74" y="52" width="8" height="28" fill="#8d6a4a" />
      <rect x="20" y="28" width="36" height="12" rx="1" fill="#fffaf4" stroke={ink} />
    </g>
  );
}

function chairSprite() {
  return (
    <g>
      <rect x="28" y="36" width="44" height="10" rx="2" fill="#c45c26" stroke={ink} />
      <rect x="30" y="46" width="8" height="30" fill="#8d6a4a" />
      <rect x="62" y="46" width="8" height="30" fill="#8d6a4a" />
      <rect x="28" y="22" width="8" height="18" fill="#c45c26" />
    </g>
  );
}

function blackboardSprite() {
  return (
    <g>
      <rect x="10" y="18" width="80" height="52" rx="3" fill="#1f3d32" stroke={ink} strokeWidth="2" />
      <rect x="18" y="70" width="64" height="6" fill="#8d6a4a" />
      <text x="50" y="50" textAnchor="middle" fontSize="16" fill="#d8efe9">
        가
      </text>
    </g>
  );
}

function windowSprite() {
  return (
    <g>
      <rect x="18" y="18" width="64" height="64" rx="2" fill="#cfe0f0" stroke={ink} strokeWidth="2" />
      <line x1="50" y1="18" x2="50" y2="82" stroke={ink} strokeWidth="2" />
      <line x1="18" y1="50" x2="82" y2="50" stroke={ink} strokeWidth="2" />
    </g>
  );
}

function doorSprite() {
  return (
    <g>
      <rect x="28" y="12" width="44" height="76" rx="2" fill="#8d6a4a" stroke={ink} strokeWidth="2" />
      <circle cx="60" cy="52" r="3" fill="#f5f0a8" />
    </g>
  );
}

function clockSprite() {
  return (
    <g>
      <circle cx="50" cy="50" r="28" fill="#fffaf4" stroke={ink} strokeWidth="2" />
      <line x1="50" y1="50" x2="50" y2="30" stroke={accent} strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="50" x2="66" y2="50" stroke={accent2} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="50" cy="50" r="3" fill={ink} />
    </g>
  );
}

function bagSprite() {
  return (
    <g>
      <rect x="28" y="36" width="44" height="40" rx="6" fill="#0f6b5c" stroke={ink} />
      <path d="M40 36 C40 24 60 24 60 36" fill="none" stroke={ink} strokeWidth="3" />
    </g>
  );
}

function bookSprite() {
  return (
    <g>
      <rect x="24" y="22" width="52" height="56" rx="2" fill="#c45c26" stroke={ink} />
      <rect x="30" y="28" width="40" height="44" fill="#fffaf4" />
      <line x1="36" y1="40" x2="64" y2="40" stroke={ink} />
      <line x1="36" y1="50" x2="64" y2="50" stroke={ink} />
    </g>
  );
}

function computerSprite() {
  return (
    <g>
      <rect x="18" y="22" width="64" height="40" rx="3" fill="#3d564b" stroke={ink} />
      <rect x="24" y="28" width="52" height="28" fill="#cfe7df" />
      <rect x="36" y="64" width="28" height="6" fill="#8d6a4a" />
      <rect x="28" y="70" width="44" height="8" rx="2" fill="#5a5a5a" />
    </g>
  );
}

function bedSprite() {
  return (
    <g>
      <rect x="10" y="48" width="80" height="24" rx="3" fill="#d8efe9" stroke={ink} />
      <rect x="10" y="36" width="22" height="16" rx="3" fill="#fffaf4" stroke={ink} />
      <rect x="14" y="72" width="8" height="12" fill="#8d6a4a" />
      <rect x="78" y="72" width="8" height="12" fill="#8d6a4a" />
    </g>
  );
}

function sofaSprite() {
  return (
    <g>
      <rect x="12" y="42" width="76" height="28" rx="8" fill="#c45c26" stroke={ink} />
      <rect x="12" y="30" width="16" height="24" rx="6" fill="#a84c20" />
      <rect x="72" y="30" width="16" height="24" rx="6" fill="#a84c20" />
      <rect x="20" y="70" width="10" height="10" fill="#8d6a4a" />
      <rect x="70" y="70" width="10" height="10" fill="#8d6a4a" />
    </g>
  );
}

function tableSprite() {
  return (
    <g>
      <ellipse cx="50" cy="42" rx="36" ry="14" fill="#c4a574" stroke={ink} />
      <rect x="46" y="42" width="8" height="34" fill="#8d6a4a" />
      <rect x="30" y="74" width="40" height="6" rx="2" fill="#8d6a4a" />
    </g>
  );
}

function roomFrame(fill: string, mark: string) {
  return (
    <g>
      <rect x="4" y="4" width="92" height="92" rx="6" fill={fill} stroke={ink} strokeWidth="2" />
      <text
        x="50"
        y="54"
        textAnchor="middle"
        fontSize="18"
        fontWeight="700"
        fill={accent}
        className="ko-text"
      >
        {mark}
      </text>
    </g>
  );
}

function toiletSprite() {
  return (
    <g>
      <rect x="4" y="4" width="92" height="92" rx="6" fill="#e8f2f6" stroke={ink} strokeWidth="2" />
      <ellipse cx="50" cy="58" rx="18" ry="12" fill="#fffaf4" stroke={ink} />
      <rect x="42" y="28" width="16" height="22" rx="4" fill="#fffaf4" stroke={ink} />
    </g>
  );
}

export function Sprite({ id }: { id: SpriteId }) {
  switch (id) {
    case "school":
      return schoolSprite();
    case "hospital":
      return hospitalSprite();
    case "bank":
      return bankSprite();
    case "pharmacy":
      return pharmacySprite();
    case "bookstore":
      return bookstoreSprite();
    case "convenience":
      return convenienceSprite();
    case "restaurant":
      return restaurantSprite();
    case "cafe":
      return cafeSprite();
    case "house":
      return houseSprite();
    case "tree":
      return treeSprite();
    case "road":
      return roadSprite();
    case "person":
      return personSprite("#0f6b5c");
    case "person-2":
      return personSprite("#c45c26");
    case "desk":
      return deskSprite();
    case "chair":
      return chairSprite();
    case "blackboard":
      return blackboardSprite();
    case "window":
      return windowSprite();
    case "door":
      return doorSprite();
    case "clock":
      return clockSprite();
    case "bag":
      return bagSprite();
    case "book":
      return bookSprite();
    case "computer":
      return computerSprite();
    case "bed":
      return bedSprite();
    case "sofa":
      return sofaSprite();
    case "table":
      return tableSprite();
    case "room":
      return roomFrame("#fff6eb", "방");
    case "toilet":
      return toiletSprite();
    case "office":
      return roomFrame("#e8dfd0", "사무실");
    case "library":
      return roomFrame("#d8efe9", "도서관");
    default: {
      const _exhaustive: never = id;
      return _exhaustive;
    }
  }
}
