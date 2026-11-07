package com.example.demojpa.service;

import com.example.demojpa.dto.StockEntry;
import com.example.demojpa.entity.Inventory;
import com.example.demojpa.entity.Product;
import com.example.demojpa.entity.StoreBranch;
import com.example.demojpa.repository.InventoryRepository;
import com.example.demojpa.repository.ProductRepository;
import com.example.demojpa.repository.StoreBranchRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service: InventoryService (Quản lý nghiệp vụ Tồn kho & Chi nhánh siêu thị ĐMX)
 * Phân hệ 2 do bạn Diễm phụ trách chính.
 */
@Service
public class InventoryService {

    private final InventoryRepository inventoryRepo;
    private final StoreBranchRepository branchRepo;
    private final ProductRepository productRepo;

    public InventoryService(InventoryRepository inventoryRepo, StoreBranchRepository branchRepo, ProductRepository productRepo) {
        this.inventoryRepo = inventoryRepo;
        this.branchRepo = branchRepo;
        this.productRepo = productRepo;
    }

    public List<StoreBranch> getAllBranches() {
        return branchRepo.findAll();
    }

    public List<Inventory> getInventoryByBranch(Long branchId) {
        return inventoryRepo.findByBranchWithDetails(branchId);
    }

    public List<Inventory> getInventoryByProduct(Long productId) {
        return inventoryRepo.findByProduct_Id(productId);
    }

    public Optional<Inventory> checkInventory(String sku, String district) {
        return inventoryRepo.findByProduct_SkuAndStoreBranch_District(sku, district);
    }

    /** Trả về ma trận tồn kho phẳng (productId × branchId) bằng 1 câu JPQL duy nhất. */
    public List<StockEntry> getStockMatrix() {
        return inventoryRepo.findStockMatrix();
    }

    public Inventory updateStock(Long productId, Long branchId, Integer quantity) {
        Optional<Inventory> existing = inventoryRepo.findByProduct_IdAndStoreBranch_Id(productId, branchId);
        if (existing.isPresent()) {
            Inventory inv = existing.get();
            inv.setQuantity(quantity);
            return inventoryRepo.save(inv);
        } else {
            Optional<Product> prodOpt = productRepo.findById(productId);
            Optional<StoreBranch> branchOpt = branchRepo.findById(branchId);
            if (prodOpt.isPresent() && branchOpt.isPresent()) {
                Inventory newInv = new Inventory(prodOpt.get(), branchOpt.get(), quantity);
                return inventoryRepo.save(newInv);
            }
            throw new IllegalArgumentException("Không tìm thấy Sản phẩm hoặc Chi nhánh tương ứng!");
        }
    }
}
