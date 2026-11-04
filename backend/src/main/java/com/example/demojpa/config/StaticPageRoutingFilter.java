package com.example.demojpa.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Cau hinh dinh tuyen URL sach (clean URL) cho giao dien tinh Next.js.
 *
 * BOI CANH:
 *   Frontend duoc build bang `next build` voi `output: 'export'` nen sinh ra cac file
 *   tinh dang "cart.html", "product/DMX-TV-001.html" nam trong classpath:/static/.
 *   Tuy nhien cac the <a> trong bundle lai tro toi duong dan sach "/cart",
 *   "/product/DMX-TV-001" -> Spring Boot khong tim thay file tuong ung -> tra ve 404.
 *
 * GIAI PHAP:
 *   Filter nay chi lam MOT viec duy nhat: voi moi request GET khong co duoi file,
 *   thu tim file "<uri>.html" trong classpath:/static/.
 *     - Neu TIM THAY  -> forward noi bo toi file .html do (trinh duyet van giu URL sach).
 *     - Neu KHONG THAY -> tra request ve cho chuoi filter tiep theo, de Spring xu ly
 *                         nhu binh thuong (404, hoac do REST API dam nhiem).
 *
 * PHAM VI ANH HUONG:
 *   - Khong dong toi bat ky Controller / Service / Repository nao cua Phan he 2.
 *   - Bo qua hoan toan "/api/**" nen toan bo REST API giu nguyen hanh vi cu.
 *   - Request da co duoi file (vi du "/cart.html", "/_next/static/...js") duoc bo qua
 *     de Spring Boot tiep tuc phuc vu bang ResourceHttpRequestHandler mac dinh.
 */
@Component
public class StaticPageRoutingFilter extends OncePerRequestFilter {

    /** Thu muc goc chua toan bo file tinh duoc Next.js xuat ra. */
    private static final String STATIC_ROOT = "static";

    /** Duoi file can thu them vao URL sach. */
    private static final String HTML_SUFFIX = ".html";

    /** Tien to REST API - tuyet doi khong duoc dinh tuyen lai. */
    private static final String API_PREFIX = "/api/";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        // Chi xu ly GET: PUT/POST/DELETE cua REST API khong lien quan toi trang tinh.
        if ("GET".equalsIgnoreCase(request.getMethod())) {
            String htmlPage = resolveHtmlPage(request.getRequestURI());
            if (htmlPage != null) {
                // Forward noi bo: trinh duyet van hien "localhost:8088/cart"
                request.getRequestDispatcher(htmlPage).forward(request, response);
                return;
            }
        }

        // Khong phai trang tinh -> de Spring Boot xu ly tiep nhu binh thuong.
        chain.doFilter(request, response);
    }

    /**
     * Tim file .html tuong ung voi mot duong dan sach.
     *
     * @param uri vi du "/cart", "/product/DMX-TV-001"
     * @return duong dan file can forward (vi du "/cart.html"), hoac null neu khong co
     */
    private String resolveHtmlPage(String uri) {
        if (uri == null || !uri.startsWith("/")) {
            return null;
        }

        // Chuan hoa: gop cac dau "/" lien tiep ("//cart" -> "/cart") va bo "/" cuoi.
        String clean = uri.replaceAll("/{2,}", "/");
        if (clean.length() > 1 && clean.endsWith("/")) {
            clean = clean.substring(0, clean.length() - 1);
        }

        // Chong path traversal: khong cho phep ".." thoat ra ngoai thu muc static.
        if (clean.contains("..")) {
            return null;
        }

        // Khong bao gio dinh tuyen lai REST API.
        if (clean.startsWith(API_PREFIX)) {
            return null;
        }

        // Doan cuoi cua URL: "/product/DMX-TV-001" -> "DMX-TV-001"
        String lastSegment = clean.substring(clean.lastIndexOf('/') + 1);

        // "- Rong (vi du "/") : de Spring Boot xu ly welcome page (static/index.html).
        // "- Co dau cham (.html, .js, .css, .png, .ico, .txt) : file tinh that su, bo qua.
        if (lastSegment.isEmpty() || lastSegment.contains(".")) {
            return null;
        }

        String candidate = clean + HTML_SUFFIX;

        // Chi forward khi file thuc su ton tai, tranh bien 404 that thanh loi kho hieu.
        return new ClassPathResource(STATIC_ROOT + candidate).exists() ? candidate : null;
    }
}
