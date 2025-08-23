import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

export interface PaginationData {
  content: any[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnChanges {
  @Input() paginationData: PaginationData = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 10,
    first: true,
    last: true
  };
  
  @Input() pageSizeOptions: number[] = [5, 10, 20, 50];
  @Input() isLoading: boolean = false;
  @Input() showPageSizeSelector: boolean = true;
  @Input() showQuickJump: boolean = true;
  @Input() maxVisiblePages: number = 7;

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  ngOnChanges(changes: SimpleChanges): void {
    // React to changes in pagination data if needed
  }

  loadPage(page: number): void {
    if (page < 0 || page >= this.paginationData.totalPages || page === this.paginationData.number || this.isLoading) {
      return;
    }
    this.pageChange.emit(page);
  }

  changePageSize(newSize: number): void {
    if (newSize === this.paginationData.size || this.isLoading) {
      return;
    }
    this.pageSizeChange.emit(newSize);
  }

  goToFirstPage(): void {
    this.loadPage(0);
  }

  goToPreviousPage(): void {
    this.loadPage(this.paginationData.number - 1);
  }

  goToNextPage(): void {
    this.loadPage(this.paginationData.number + 1);
  }

  goToLastPage(): void {
    this.loadPage(this.paginationData.totalPages - 1);
  }

  getCurrentPageDisplay(): number {
    return this.paginationData.number + 1;
  }

  getTotalPages(): number {
    return this.paginationData.totalPages;
  }

  getStartIndex(): number {
    return (this.paginationData.number * this.paginationData.size) + 1;
  }

  getEndIndex(): number {
    return Math.min((this.paginationData.number + 1) * this.paginationData.size, this.paginationData.totalElements);
  }

  getTotalElements(): number {
    return this.paginationData.totalElements;
  }

  getPageNumbers(): number[] {
    const totalPages = this.paginationData.totalPages;
    const currentPage = this.paginationData.number;
    const pages: number[] = [];

    if (totalPages <= 0) {
      return pages;
    }

    const maxPages = this.maxVisiblePages;
    let startPage = Math.max(0, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxPages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(0, endPage - maxPages + 1);
    }

    // Add ellipsis logic for large page counts
    if (totalPages > maxPages) {
      if (startPage > 0) {
        pages.push(0); // Always show first page
        if (startPage > 1) {
          pages.push(-1); // -1 represents ellipsis
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        if (i !== 0 && i !== totalPages - 1) { // Don't duplicate first/last pages
          pages.push(i);
        }
      }

      if (endPage < totalPages - 1) {
        if (endPage < totalPages - 2) {
          pages.push(-1); // -1 represents ellipsis
        }
        pages.push(totalPages - 1); // Always show last page
      }
    } else {
      // Show all pages if total is small
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  isEllipsis(page: number): boolean {
    return page === -1;
  }

  onQuickJump(event: any): void {
    const pageNumber = parseInt(event.target.value, 10);
    if (pageNumber && pageNumber >= 1 && pageNumber <= this.getTotalPages()) {
      this.loadPage(pageNumber - 1);
    }
  }

  getPaginationSummary(): string {
    if (this.paginationData.totalElements === 0) {
      return 'No items found';
    }
    
    const start = this.getStartIndex();
    const end = this.getEndIndex();
    const total = this.getTotalElements();
    
    if (start === end) {
      return `Showing ${start} of ${total} item${total !== 1 ? 's' : ''}`;
    }
    
    return `Showing ${start}-${end} of ${total} item${total !== 1 ? 's' : ''}`;
  }
}
