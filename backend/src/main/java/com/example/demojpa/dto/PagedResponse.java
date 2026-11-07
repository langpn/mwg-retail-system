package com.example.demojpa.dto;

import org.springframework.data.domain.Page;
import java.util.List;

/**
 * Gói kết quả phân trang của Spring Data Page thành JSON phẳng ổn định,
 * tránh serialize PageImpl nội bộ từ Spring Boot 3.x+.
 * Contract với Frontend: content, page, size, totalElements, totalPages, first, last.
 */
public class PagedResponse<T> {

    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;

    public PagedResponse() {}

    public PagedResponse(List<T> content, int page, int size,
                         long totalElements, int totalPages, boolean first, boolean last) {
        this.content = content;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.first = first;
        this.last = last;
    }

    /** Chuyển Page<T> của Spring Data sang PagedResponse<T> — một dòng ở Controller. */
    public static <T> PagedResponse<T> from(Page<T> p) {
        return new PagedResponse<>(p.getContent(), p.getNumber(), p.getSize(),
                p.getTotalElements(), p.getTotalPages(), p.isFirst(), p.isLast());
    }

    public List<T> getContent() { return content; }
    public void setContent(List<T> content) { this.content = content; }
    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }
    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }
    public long getTotalElements() { return totalElements; }
    public void setTotalElements(long totalElements) { this.totalElements = totalElements; }
    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }
    public boolean isFirst() { return first; }
    public void setFirst(boolean first) { this.first = first; }
    public boolean isLast() { return last; }
    public void setLast(boolean last) { this.last = last; }
}
