package com.example.filestore.model;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FileDocument {
    private String id;
    private String name;
    private boolean isDir;
}
