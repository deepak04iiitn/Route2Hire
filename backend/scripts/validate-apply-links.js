import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const linkCheck = require('link-check');

const DEFAULT_INPUT = path.resolve(process.cwd(), 'backend', 'scripts', 'naukri_apply_links.csv');
const OUTPUT_FILENAME = 'naukri_apply_links_valid.csv';

function readCsv(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .filter((l, idx) => (idx === 0 ? l.toLowerCase() !== 'apply_link' : true))
    .map((l) => {
      // handle potential quoted CSV values
      try {
        return JSON.parse(l);
      } catch {
        return l.replace(/^"|"$/g, '');
      }
    });
}

function isValidUrl(urlString) {
  try {
    // First check for obvious malformed patterns - more aggressive
    if (
      /<br\s*\/?>/gi.test(urlString) || 
      /%3Cbr%3E/gi.test(urlString) ||
      /%3Cbr\/%3E/gi.test(urlString) ||
      /%3C\/br%3E/gi.test(urlString) ||
      /corp.*%3Cbr.*com/i.test(urlString) || // Specific pattern from error
      /%3Cbr.*com/i.test(urlString) ||
      /com.*%3Cbr/i.test(urlString)
    ) {
      return false;
    }
    
    const url = new URL(urlString);
    
    // Validate protocol
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }
    
    // Check that hostname is valid (not empty and doesn't contain HTML entities)
    if (!url.hostname || /<|>|%3C|%3E|br/gi.test(url.hostname)) {
      return false;
    }
    
    // Check that the path doesn't contain HTML entities
    if (/<|>|%3C|%3E|%3Cbr/i.test(url.pathname)) {
      return false;
    }
    
    // Check the full href for HTML entities as well
    if (/<|>|%3C|%3E|%3Cbr/i.test(url.href)) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

function cleanUrl(url) {
  if (!url || typeof url !== 'string') return null;
  
  let cleaned = url.trim();
  
  // Remove HTML entities that might be embedded anywhere in the URL (case-insensitive)
  cleaned = cleaned
    .replace(/%3Cbr%3E/gi, '')
    .replace(/%3C\/br%3E/gi, '')
    .replace(/%3Cbr\/%3E/gi, '')
    .replace(/%3C/i, '') // Remove any %3C (<)
    .replace(/%3E/i, '') // Remove any %3E (>)
    .replace(/<br\s*\/?>/gi, '') // Also catch decoded <br> tags
    .replace(/&lt;br\s*\/?&gt;/gi, '') // HTML-encoded <br> tags
    .trim();
  
  // Try to decode URI component multiple times to handle nested encoding
  let decodeAttempts = 3;
  while (decodeAttempts > 0) {
    try {
      const decoded = decodeURIComponent(cleaned);
      if (decoded === cleaned) break; // No more decoding needed
      cleaned = decoded;
      // Remove any HTML tags that got decoded
      cleaned = cleaned.replace(/<[^>]*>/g, '');
      // Remove any remaining angle brackets that might break URL parsing
      cleaned = cleaned.replace(/[<>]/g, '');
    } catch {
      // Can't decode further, break
      break;
    }
    decodeAttempts--;
  }
  
  // Final cleanup - remove any remaining HTML tags and angle brackets
  cleaned = cleaned.replace(/<[^>]*>/g, '').replace(/[<>]/g, '').trim();
  
  // Validate that it still looks like a URL after cleaning
  if (!cleaned || !cleaned.match(/^https?:\/\//i)) {
    return null;
  }
  
  // Additional validation: try to parse it as a URL to ensure it's valid
  try {
    const testUrl = new URL(cleaned);
    // If hostname is malformed, reject it
    if (!testUrl.hostname || testUrl.hostname.includes('<') || testUrl.hostname.includes('>')) {
      return null;
    }
  } catch {
    return null;
  }
  
  return cleaned || null;
}

function truncateUrl(url, maxLength = 80) {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength - 3) + '...';
}

function getStatusIcon(status) {
  switch (status) {
    case 'alive': return '✓';
    case 'dead': return '✗';
    case 'invalid': return '⚠';
    case 'error': return '✗';
    default: return '?';
  }
}

function checkLink(url, index, total) {
  const displayUrl = truncateUrl(url, 80);
  console.log(`[${index + 1}/${total}] Checking: ${displayUrl}`);
  
  const TIMEOUT_MS = 15000; // 15 seconds timeout per URL
  
  return new Promise((resolve) => {
    // First validate URL format strictly
    if (!isValidUrl(url)) {
      const result = { url, status: 'invalid', err: 'Invalid URL format' };
      console.log(`  ${getStatusIcon('invalid')} INVALID - ${url}`);
      return resolve(result);
    }
    
    // Wrap linkCheck call to catch both sync and async errors
    let linkCheckCalled = false;
    const resolveOnce = (result) => {
      if (!linkCheckCalled) {
        linkCheckCalled = true;
        resolve(result);
      }
    };
    
    // Set a timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      if (!linkCheckCalled) {
        const result = { url, status: 'error', err: 'Timeout - URL took too long to respond' };
        console.log(`  ${getStatusIcon('error')} TIMEOUT - ${url}`);
        resolveOnce(result);
      }
    }, TIMEOUT_MS);
    
    try {
      // Use a small delay to ensure we can catch synchronous errors
      process.nextTick(() => {
        try {
          linkCheck(url, {}, (err, res) => {
            clearTimeout(timeoutId);
            const result = err 
              ? { url, status: 'error', err: String(err) }
              : { url, status: res.status, statusCode: res.statusCode || null };
            
            // Log the result
            const icon = getStatusIcon(result.status);
            const statusText = result.status.toUpperCase();
            const statusCode = result.statusCode ? ` (${result.statusCode})` : '';
            console.log(`  ${icon} ${statusText}${statusCode} - ${url}`);
            
            resolveOnce(result);
          });
        } catch (error) {
          clearTimeout(timeoutId);
          const result = { url, status: 'error', err: String(error) };
          console.log(`  ${getStatusIcon('error')} ERROR: ${error.message || String(error)} - ${url}`);
          resolveOnce(result);
        }
      });
    } catch (error) {
      clearTimeout(timeoutId);
      const result = { url, status: 'error', err: String(error) };
      console.log(`  ${getStatusIcon('error')} ERROR: ${error.message || String(error)} - ${url}`);
      resolveOnce(result);
    }
  });
}

async function processInBatches(items, batchSize, handler) {
  const results = [];
  const total = items.length;
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchStart = Date.now();
    
    try {
      const batchResults = await Promise.allSettled(
        batch.map((item, batchIndex) => handler(item, i + batchIndex, total))
      );
      
      // Process settled results
      batchResults.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          // If promise rejected, create an error result
          const errorResult = { 
            url: batch[idx], 
            status: 'error', 
            err: String(result.reason || 'Unknown error') 
          };
          console.log(`  ${getStatusIcon('error')} ERROR: ${result.reason?.message || String(result.reason)} - ${batch[idx]}`);
          results.push(errorResult);
        }
      });
    } catch (error) {
      // If the entire batch fails, mark each as error
      batch.forEach((item, batchIndex) => {
        const errorResult = { 
          url: item, 
          status: 'error', 
          err: String(error) 
        };
        console.log(`  ${getStatusIcon('error')} ERROR: ${error.message || String(error)} - ${item}`);
        results.push(errorResult);
      });
    }
    
    const batchTime = ((Date.now() - batchStart) / 1000).toFixed(1);
    const processed = Math.min(i + batchSize, total);
    console.log(`\nBatch complete: ${processed}/${total} URLs processed (batch took ${batchTime}s)\n`);
    
    // light pacing to be polite
    await new Promise((r) => setTimeout(r, 100));
  }
  return results;
}

async function main() {
  // Add global error handlers to prevent crashes - these errors will be logged but won't stop execution
  const errorUrls = new Set();
  let uncaughtErrorCount = 0;
  
  process.on('uncaughtException', (error) => {
    uncaughtErrorCount++;
    if (error.code === 'ERR_INVALID_URL' && error.input) {
      const badUrl = error.input;
      errorUrls.add(badUrl);
      console.log(`\n  ${getStatusIcon('error')} INVALID URL (caught in link-check): ${badUrl}`);
      // Don't exit - continue processing
    } else {
      console.error(`\nUncaught exception (${uncaughtErrorCount}): ${error.message}`);
      if (error.stack && uncaughtErrorCount <= 3) {
        console.error(`Stack: ${error.stack.split('\n')[0]}`);
      }
    }
    // Explicitly don't exit - we want to continue
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error(`\nUnhandled rejection: ${String(reason)}`);
    // Don't exit - continue processing
  });
  
  const inputPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_INPUT;
  if (!fs.existsSync(inputPath)) {
    console.error(`Input CSV not found at: ${inputPath}`);
    process.exit(1);
  }

  const rawUrls = readCsv(inputPath);
  if (rawUrls.length === 0) {
    console.log('No URLs found in input CSV.');
    const outEmpty = path.resolve(path.dirname(inputPath), OUTPUT_FILENAME);
    fs.writeFileSync(outEmpty, 'apply_link\n', 'utf8');
    console.log(`Saved empty CSV to: ${outEmpty}`);
    return;
  }

  // Clean and filter URLs, then validate them
  const urls = rawUrls
    .map((u) => cleanUrl(u))
    .filter((u) => u !== null && u.length > 0)
    .filter((u) => isValidUrl(u)); // Final validation after cleaning

  console.log(`Read ${rawUrls.length} URLs from CSV`);
  console.log(`After cleaning: ${urls.length} URLs to validate`);
  console.log(`Validating ${urls.length} URLs using link-check...`);
  console.log(`Timeout: 15 seconds per URL\n`);

  const concurrency = Number(process.env.LINK_CHECK_CONCURRENCY || 10);

  const handler = (u) => checkLink(u);

  // slice-based batching to limit concurrency
  const results = await processInBatches(urls, concurrency, handler);

  const valid = results.filter((r) => r.status === 'alive').map((r) => r.url);
  const invalid = results.filter((r) => r.status !== 'alive');

  const outPath = path.resolve(path.dirname(inputPath), OUTPUT_FILENAME);
  const header = 'apply_link';
  const csvLines = [header, ...valid.map((l) => JSON.stringify(l))];
  fs.writeFileSync(outPath, csvLines.join('\n'), 'utf8');

  console.log(`\nChecked: ${results.length}`);
  console.log(`Alive:   ${valid.length}`);
  console.log(`Dead/Err:${invalid.length}`);
  console.log(`Saved valid URLs to: ${outPath}`);
}

main().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(1);
});


