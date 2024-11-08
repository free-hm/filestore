package com.example.filestore.controller;

import com.example.filestore.model.FileDocument;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
@Controller
@RequestMapping("/api/files")
public class FileController {

    @Value("${file.upload-dir}")
    private String uploadDir;

    // Endpoint to upload a file
    @PostMapping
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file,@RequestParam(value = "path", required = false) String path) {
        String targetDir = (path != null && !path.isEmpty()) ? uploadDir + File.separator + path : uploadDir;
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }

        try {
            // Create the directory if it doesn't exist
            File uploadDirFile = new File(targetDir);
            if (!uploadDirFile.exists()) {
                uploadDirFile.mkdirs();
            }

            // Save the file to the file system
            Path filePath = Paths.get(targetDir, file.getOriginalFilename());
            Files.copy(file.getInputStream(), filePath);

            return ResponseEntity.ok("File uploaded successfully: " + file.getOriginalFilename());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload file");
        }
    }

    @GetMapping
    public ResponseEntity<List<FileDocument>> listFiles(@RequestParam(required = false, defaultValue = "") String path) {
        List<FileDocument> files = new ArrayList<>();
        File folder = new File(uploadDir + File.separator + path);

        if (folder.exists() && folder.isDirectory()) {
            for (File file : folder.listFiles()) {
                files.add(new FileDocument(file.getName(), file.getName(), file.isDirectory()));
            }
        }
        return ResponseEntity.ok(files);
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteFiles(@RequestBody List<String> filenames) {
        boolean errorOccurred = false;

        for (String filename : filenames) {
            try {
                Path filePath = Paths.get(uploadDir).resolve(filename);
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                errorOccurred = true; // Mark that an error occurred, but continue deleting other files
            }
        }

        if (errorOccurred) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } else {
            return ResponseEntity.noContent().build();
        }
    }

    @GetMapping("/download")
    public ResponseEntity<Resource> downloadFile(@RequestParam("path") String path) {
        try {
            // Determine the full path of the file to be downloaded
            String fullPath = uploadDir + File.separator + path;
            File file = new File(fullPath);

            if (!file.exists() || !file.isFile()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }

            Resource resource = new FileSystemResource(file);

            return ResponseEntity.ok()
                    .contentLength(file.length())
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
