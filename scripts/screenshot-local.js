#!/usr/bin/env node

/**
 * Local development screenshot script for cat-oscilloscope
 * 
 * ローカル開発環境でcat-oscilloscopeのスクリーンショットを撮影します。
 * テストページを開き、ボタンをクリックしてデモを開始し、
 * オシロスコープが動作している状態をキャプチャします。
 * 
 * 使用方法:
 *   node scripts/screenshot-local.js [TEST_PAGE] [OUTPUT_PATH]
 * 
 * 引数:
 *   TEST_PAGE - テストページのパス（省略時: test-pages/test-canvas-dimension-warning.html）
 *   OUTPUT_PATH - スクリーンショットの保存先（省略時: screenshots/local-test.png）
 * 
 * 環境変数:
 *   PORT - 開発サーバーのポート（デフォルト: 3000）
 *   WAIT_TIME - クリック後の待機時間（ミリ秒、デフォルト: 2000）
 *   VERBOSE - 詳細ログを有効化（1で有効）
 * 
 * 例:
 *   node scripts/screenshot-local.js
 *   node scripts/screenshot-local.js test-pages/test-canvas-dimension-warning.html screenshots/dimension-warning.png
 *   VERBOSE=1 WAIT_TIME=3000 node scripts/screenshot-local.js
 */

// Playwrightがインストールされているか確認
try {
  require('playwright');
} catch (error) {
  console.error('❌ Playwrightがインストールされていません。');
  console.error('');
  console.error('以下のコマンドでインストールしてください:');
  console.error('  npm install --save-dev playwright');
  console.error('  npx playwright install chromium');
  console.error('');
  process.exit(1);
}

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// デフォルト設定
const DEFAULT_PORT = process.env.PORT || 3000;
const DEFAULT_BASE_PATH = '/cat-oscilloscope';
const DEFAULT_TEST_PAGE = 'test-pages/test-canvas-dimension-warning.html';
const DEFAULT_OUTPUT = 'screenshots/local-test.png';
const DEFAULT_WAIT_TIME = 2000;

async function takeScreenshot(testPage, outputPath) {
  const port = DEFAULT_PORT;
  const url = `http://localhost:${port}${DEFAULT_BASE_PATH}/${testPage}`;
  
  console.log(`\n📸 ローカル開発スクリーンショット撮影を開始\n`);
  console.log(`  URL: ${url}`);
  console.log(`  出力先: ${outputPath}\n`);
  
  let browser;
  
  try {
    // 出力ディレクトリを作成
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // ブラウザを起動
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    
    const page = await context.newPage();
    
    // コンソールログを収集
    if (process.env.VERBOSE) {
      page.on('console', msg => {
        console.log(`  📝 Console ${msg.type()}: ${msg.text()}`);
      });
      
      page.on('pageerror', error => {
        console.log(`  ❌ Page Error: ${error.message}`);
      });
    }
    
    // ステップ1: ページのロード
    console.log('ステップ1: ページをロード中...');
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    console.log('  ✅ ページがロードされました');
    
    // ステップ2: 初期化を待つ
    console.log('\nステップ2: JavaScriptの初期化を待機中...');
    await page.waitForLoadState('domcontentloaded', { timeout: 5000 });
    await page.waitForLoadState('load', { timeout: 5000 });
    console.log('  ✅ 初期化完了');
    
    // ステップ3: デモ開始ボタンをクリック
    console.log('\nステップ3: デモを開始（ボタンをクリック）...');
    try {
      // "Start 440Hz Sine Wave Demo" ボタンを探してクリック
      const button = await page.locator('button:has-text("Start")').first();
      await button.click({ timeout: 5000 });
      console.log('  ✅ クリック完了');
    } catch (error) {
      console.warn('  ⚠️ ボタンが見つかりませんでした。ページ全体をクリックします。');
      await page.click('body');
    }
    
    // ステップ4: オシロスコープの表示を待つ
    const waitTime = parseInt(process.env.WAIT_TIME || DEFAULT_WAIT_TIME);
    console.log(`\nステップ4: オシロスコープの表示を待機（${waitTime}ms）...`);
    await page.waitForTimeout(waitTime);
    console.log('  ✅ 待機完了');
    
    // ステップ5: スクリーンショットを撮影
    console.log(`\nステップ5: スクリーンショットを撮影中...`);
    await page.screenshot({
      path: outputPath,
      fullPage: true
    });
    console.log(`  ✅ スクリーンショットを保存しました: ${outputPath}`);
    
  } catch (error) {
    console.error(`\n❌ エラーが発生しました: ${error.message}`);
    if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
      console.error('\n💡 ヒント: 開発サーバーが起動していますか？');
      console.error(`   以下のコマンドで起動してください: npm run dev`);
    }
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ スクリーンショット撮影完了');
  console.log('='.repeat(60) + '\n');
}

// メイン処理
const testPage = process.argv[2] || DEFAULT_TEST_PAGE;
const outputPath = process.argv[3] || DEFAULT_OUTPUT;

takeScreenshot(testPage, outputPath).catch(error => {
  console.error(`\n❌ 予期しないエラー: ${error.message}`);
  console.error(error.stack);
  process.exit(1);
});
