# AGENTS.md

# GOAL
- ユーザーの指示どおりに、**シンプルで読みやすく、モジュール化されたコード**を書く。  
- **余計な推測や機能追加は禁止。** 要件定義と明示的な指示を最優先とする。  
- **コンポーネントを細かく分け、責務を明確に**し、エラー箇所を特定しやすくする。  
- **Turbopackを無効化（レガシービルダー使用）**し、Next.js 16系で安定的に構築する。  

---

# ABOUT PROJECT
- プロジェクト名：**チズナシ！（Chizunashi!）**  
- テーマ：「地図を使わない旅」  
- 概要：地図を表示せず、目的地の**方向・距離・方角**のみを矢印で示すシングルビューPWA。  
- デプロイ先：**Netlify**  
- 技術スタック：
  - **Next.js 16 (App Router, TypeScript)**
  - **Netlify Functions**（Google Places API 経由）
  - **PWA 対応（manifest.json + Service Worker）**
  - **Google Places API (New / v1)**
  - **環境変数：`PLACES_API_KEY`**
- ビルド：
  - `npm run dev` → `NEXT_SKIP_TURBOPACK=1 next dev`
  - `npm run build` → `next build`（--turbopack禁止）
  - `npm run start` → `next start`

---

# MODUS OPERANDI
- コードは**短く・明快・責務単位で分離**。  
- UI・状態管理・ロジックを分け、**コンポーネント単位で再利用・検証可能にする。**  
- コメントは「なぜそうしたか」を簡潔に書く。  
- UIは**黒×白×赤のミニマルデザイン**で統一。  
- **モバイル縦画面専用**（iOS 15+/Safari, Android 11+/Chrome）。  
- 検索・測位・コンパスロジックは `lib/` に分離し、UIは `components/` に配置する。  

---

# DIRECTORY STRUCTURE
app/
components/
SearchBox/
StatusCard/
Compass/
Arrow/
DistanceLabel/
DirectionLabel/
lib/
geo/
heading/
parseTarget/
compassPermission/
(netlify)/
functions/
public/

markdown
コードをコピーする

---

# FUNCTIONAL REQUIREMENTS

## 🔍 検索（Places API 経由）
- 入力形式：
  1. 自然文（地名／施設名）
  2. 緯度経度（例：`35.6586,139.7454`）
  3. Googleマップ共有リンク（`https://maps.app.goo.gl/...`）
- APIルート：
  - `/api/places-autocomplete` → 候補 最大5件
  - `/api/place-details` → `{ place_id, name, lat, lng }`
- 最適化：
  - 200msデバウンス
  - セッショントークン維持（検索〜確定まで同一）
  - `languageCode=ja`, `regionCode=JP`
  - `locationBias(circle, 30km)`
  - `X-Goog-FieldMask`でレスポンス最小化
  - **同一クエリ＋同一現在地では再フェッチ禁止（キャッシュ使用）**
- 並び順：距離 → 名称 → 住所  
- 候補が1件なら自動確定、複数候補はドロップダウン選択。  
- クイック候補は即選択、手入力時のみ候補リスト表示。  

---

## 📍 方位・測位
- **位置取得**：`navigator.geolocation.watchPosition({ enableHighAccuracy: true })`  
- **方位取得**：`DeviceOrientationEvent` または `AbsoluteOrientationSensor`  
  - iOSでは `requestPermission()` 必須。  
- **到着判定**：`distance <= max(10m, accuracy * 1.2)` で停止。  
- 初回アクセス時：
  - 位置／コンパス許可ガイドを表示。  
  - ホーム画面追加ヒントを提示。  
- **StatusCard コンポーネント**で位置・方位の許可状態を表示。  

---

## 🧭 矢印ロジック（Compass）
- 内部角度は**アンラップ（unwrap）連続角**で保持。  
  - 最短差分Δ（-180〜+180）を加算して更新。  
  - ±180°は直前符号を引き継ぐ。  
- 表示角は**7°刻み丸め（quantize）**。  
- 1フレーム最大回転：**16°**  
- 微振動抑制：ヒステリシス ±3°  
- 方角ラベルは **N / NE / E / SE / S / SW / W / NW**（または日本語方位）  
- **CSSトランジションで200ms補間（見た目のみ滑らかに）**  

コンポーネント分割：
- `Compass`：全体制御・方位・距離表示  
- `Arrow`：矢印描画（rotateのみ受け取る）  
- `DistanceLabel`：距離表示  
- `DirectionLabel`：方角文字列変換  

---

# SECURITY / POLICY
- APIキーは**Netlify Functions内のみ**で使用。  
- フロントには一切露出禁止。  
- **CSP 設定（_headers）**：
default-src 'self' https:;
connect-src 'self' https://places.googleapis.com;
img-src 'self' https: data:;

markdown
コードをコピーする
- HTTPS前提、オフラインキャッシュ最小。  
- データは端末内一時保存のみ。  

---

# LEGAL
- **プライバシーポリシー**
- 位置情報は端末内で処理し、サーバーには保存しない。  
- **利用規約**
- 測位誤差や安全確保はユーザー責任。  
- 運転中の操作は禁止。  

---

# DEPLOYMENT
- **Netlify** にデプロイ。  
- 環境変数：`PLACES_API_KEY`  
- Functions：
- `netlify/functions/places-autocomplete.ts`
- `netlify/functions/place-details.ts`
- PWA構成：
- `manifest.json`
- `public/sw.js`
- フッターリンク：
- © 2025 Trift合同会社  
- [プライバシーポリシー](https://www.trift3.com/privacy)  
- [利用規約](https://www.trift3.com/terms)  
- [特定商取引法に基づく表記](https://www.trift3.com/legal)

---

# ACCEPTANCE CRITERIA
- 検索：
- 入力200ms後に候補表示。
- 候補1件なら自動確定。
- 同一クエリ＋同一位置ではキャッシュ命中。
- コンパス：
- ±180°跨ぎでも反転なし。
- 表示は7°ステップ＋200ms補間。
- 到着判定：
- `distance <= max(10m, accuracy * 1.2)` で停止。
- 権限：
- ステータスカードに赤バッジ＋許可ボタン。
- セキュリティ：
- APIキー非公開。
- CSP有効。
- ビルド：
- `npm run build` 成功（--turbopack未使用）。
- Netlify上で正常動作。

---

# TECH STACK
- **Next.js 16**
- **TypeScript**
- **Netlify Functions**
- **Google Places API (v1)**
- **PWA（Service Worker + Manifest）**
- **ESLint / Prettier**

---

# DEVELOPMENT RULES
- コンポーネントは**単一責務・独立可能**に設計する。  
- ロジックはすべて `lib/` に配置し、UIは `components/` に限定する。  
- 各モジュールは**依存注入可能**な構造を保つ。  
- エラー発生時は `console.error('[moduleName]', error)` 形式で出力。  
- 変数・関数名は `動詞 + 機能`（例：`updateHeading`, `parseTarget`）。  
- Codexは部分実装中でも構造を優先し、**動作単位で検証可能な最小ブロック**を生成する。  
- コミットやPR単位は小さく保ち、明確な差分でレビュー可能にする。  

---

# DEPLOYED ENV
- Hosting: **Netlify**
- Node.js: 18+
- Browser: iOS 15+, Android 11+
- Layout: Single View (Compass)
- Build: Legacy builder only（Turbopack無効）

---