package com.example.demojpa.dto;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * DTO: PagedResponse<T>
 * Gói kết quả phân trang của Spring Data JPA (org.springframework.data.domain.Page)
 * thành một cấu trúc JSON phẳng, ổn định và tường minh.
 *
 * LÝ DO KHÔNG TRẢ THẲNG Page<T> RA API:
 * - Lớp PageImpl của Spring Data chứa nhiều metadata nội bộ (Pageable, Sort, ...)
 *   và từ Spring Boot 3.x/4.x phát ra cảnh báo serialize (PageModule warning).
 * - Cấu trúc phẳng dưới đây là "hợp đồng" (contract) thống nhất với Frontend React:
 *   content, page, size, totalElements, totalPages, first, last.
 */
public class PagedResponse<T> {

    /** Danh sách bản ghi của trang hiện tại */
    private List<T> content;

    /** Chỉ số trang hiện tại (bắt đầu từ 0) */
    private int page;

    /** Số phần tử tối đa trên mỗi trang */
    private int size;

    /** Tổng số bản ghi thỏa mãn bộ lọc (trên toàn bộ CSDL) */
    private long totalElements;

    /** Tổng số trang tính được từ totalElements và size */
    private int totalPages;

    /** true nếu đây là trang đầu tiên */
    private boolean first;

    /** true nếu đây là trang cuối cùng */
    private boolean last;

    public PagedResponse() {
    }

    public PagedResponse(List<T> content, int page, int size,
                         long totalElements, int totalPages,
                         boolean first, boolean last) {
        this.content = content;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.first = first;
        this.last = last;
    }

    /**
     * Hàm tiện lợi chuyển Page<T> của Spring Data sang PagedResponse<T>.
     * Nhờ đó Controller chỉ cần gọi duy nhất một dòng: PagedResponse.from(pageObj).
     */
    public static <T> PagedResponse<T> from(Page<T> pageObj) {
        return new PagedResponse<>(
                pageObj.getContent(),
                pageObj.getNumber(),
                pageObj.getSize(),
                pageObj.getTotalElements(),
                pageObj.getTotalPages(),
                pageObj.isFirst(),
                pageObj.isLast()
        );
    }

    // ================= Getters and Setters =================

    public List<T> getContent() {
        return content;
    }

    public void setContent(List<T> content) {
        this.content = content;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public void setTotalElements(long totalElements) {
        this.totalElements = totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }

    public boolean isFirst() {
        return first;
    }

    public void setFirst(boolean first) {
        this.first = first;
    }

    public boolean isLast() {
        return last;
    }

    public void setLast(boolean last) {
        this.last = last;
    }
}
