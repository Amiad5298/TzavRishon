package com.tzavrishon.controller;

import jakarta.servlet.http.HttpServletResponse;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.net.URLConnection;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/proxy")
public class ImageProxyController {
  private static final List<String> ALLOWED_CONTENT_TYPES =
      Arrays.asList("image/jpeg", "image/png", "image/gif", "image/webp");
  private static final ConcurrentHashMap<String, CachedImage> cache = new ConcurrentHashMap<>();
  private static final long CACHE_DURATION_MS = 3600000; // 1 hour

  @GetMapping("/image")
  public void proxyImage(@RequestParam String url, HttpServletResponse response) {
    try {
      // Validate URL
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid URL");
        return;
      }

      // Check cache
      CachedImage cached = cache.get(url);
      if (cached != null && (System.currentTimeMillis() - cached.timestamp < CACHE_DURATION_MS)) {
        response.setContentType(cached.contentType);
        response.setContentLength(cached.data.length);
        response.getOutputStream().write(cached.data);
        return;
      }

      // Fetch image
      URLConnection connection = new URL(url).openConnection();
      connection.setConnectTimeout(5000);
      connection.setReadTimeout(10000);
      connection.setRequestProperty(
          "User-Agent",
          "Mozilla/5.0 (Tzav Rishon Image Proxy)");

      String contentType = connection.getContentType();
      if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
        response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid content type");
        return;
      }

      // Read and cache
      InputStream in = connection.getInputStream();
      byte[] data = in.readAllBytes();
      in.close();

      cache.put(url, new CachedImage(data, contentType, System.currentTimeMillis()));

      // Serve
      response.setContentType(contentType);
      response.setContentLength(data.length);
      response.getOutputStream().write(data);

    } catch (Exception e) {
      try {
        response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Failed to fetch image");
      } catch (Exception ignored) {
      }
    }
  }

  private static class CachedImage {
    final byte[] data;
    final String contentType;
    final long timestamp;

    CachedImage(byte[] data, String contentType, long timestamp) {
      this.data = data;
      this.contentType = contentType;
      this.timestamp = timestamp;
    }
  }
}

