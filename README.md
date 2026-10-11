# CodeBase

HTML / CSS / JavaScript / TypeScript / Python を、ブラウザ上で実行しながら学べるプログラミング学習アプリです。

- データベース不要
- APIキー・環境変数不要
- Node.js + npm だけで起動可能
- 学習進捗とフリースペースはブラウザの `localStorage` に保存
- Render Blueprint 対応

## ローカルで起動する

### 必要なもの

- Node.js 20.9以上（Node.js 22 LTS推奨）
- npm（Node.jsに同梱）

### 開発モード

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

### 本番モード

```bash
npm install
npm run build
npm start
```

停止するときは、起動しているターミナルで `Ctrl + C` を押します。

---

# GitHubへアップロードしてRenderで公開する

このリポジトリには `render.yaml` が入っているため、RenderのBlueprint機能でそのままデプロイできます。データベース作成や環境変数の登録は必要ありません。

## 1. GitHubに新しいリポジトリを作る

1. [GitHub](https://github.com/) にログイン
2. 右上の `+` → `New repository`
3. Repository name に例として `codebase-learning` と入力
4. Public または Private を選択
5. **Add a README fileなどにはチェックを入れない**
6. `Create repository` を押す

## 2. ダウンロードしたプロジェクトをGitHubへ送る

### 推奨：Gitコマンドを使う方法

ZIPを解凍し、そのフォルダでターミナルまたはコマンドプロンプトを開いて実行します。

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/あなたのユーザー名/codebase-learning.git
git push -u origin main
```

`あなたのユーザー名` とリポジトリ名は実際のものに置き換えてください。

Gitコマンドがない場合は [Git](https://git-scm.com/) をインストールするか、GitHub Desktopを使用できます。

### GitHub Desktopを使う方法

1. [GitHub Desktop](https://desktop.github.com/) をインストール
2. `File` → `Add local repository`
3. ZIPを解凍したプロジェクトフォルダを選択
4. リポジトリでないと言われた場合は `create a repository` を選択
5. 左下のCommit欄に `Initial commit` と入力してCommit
6. `Publish repository` を押す

> GitHubのWeb画面へファイルを直接ドラッグする方法は、ファイル数制限や隠しファイルの欠落が起きやすいため、GitまたはGitHub Desktopを推奨します。

## 3. Renderでデプロイする

1. [Render](https://render.com/) にGitHubアカウントでログイン
2. GitHubリポジトリへのアクセスを許可
3. Renderダッシュボードで `New` → `Blueprint` を選択
4. 先ほどの `codebase-learning` リポジトリを選択
5. `render.yaml` が自動検出されることを確認
6. Blueprint名は任意の名前を入力
7. `Deploy Blueprint` または `Apply` を押す

Renderが自動で以下を実行します。

```bash
npm ci
npm run build
npm start
```

デプロイ完了後、次の形式のURLが発行されます。

```text
https://codebase-learning.onrender.com
```

サービス名がすでに使われている場合、URLには別の文字列が付くことがあります。

## 更新を反映する

コードを変更したら、GitHubへpushします。

```bash
git add .
git commit -m "Update application"
git push
```

`render.yaml` で自動デプロイを有効にしているため、GitHubの `main` ブランチへpushするとRenderが自動で再ビルドします。

## Render無料プランについて

- 一定時間アクセスがないとサービスがスリープします
- スリープ後の最初のアクセスは、起動まで時間がかかる場合があります
- 外部データベースは使っていないため、DBの期限切れやマイグレーションはありません
- 学習進捗とフリースペースのファイルは、アクセスしたブラウザの `localStorage` に保存されます
- 別の端末・別のブラウザには自動同期されません
- ブラウザのサイトデータを削除すると進捗とファイルも削除されます。重要なコードはダウンロード機能で保存してください

## Render設定の内容

`render.yaml` は次の内容を自動設定します。

- Runtime: Node
- Build: `npm ci && npm run build`
- Start: `npm start`
- Health check: `/api/health`
- Auto deploy: 有効
- Database: 不要
- Secret / Environment Variables: 不要

## 主なコマンド

```bash
npm run dev        # 開発サーバー
npm run build      # 本番ビルド
npm start          # 本番サーバー
npm run typecheck  # TypeScriptチェック
npm run lint       # ESLint
```
