/** @jsxImportSource @ox-content/vite-plugin */
import type { JSXNode } from '@ox-content/vite-plugin';

type LikeButtonProps = {
  type: 'blog' | 'works';
  slug: string;
};

export function LikeButton({ type, slug }: LikeButtonProps): JSXNode {
  return (
    <div class="LikeButton js-like-button" data-type={type} data-slug={slug}>
      <button class="LikeButton__btn js-like-btn" type="button" aria-label="いいね">
        <svg class="LikeButton__icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span class="LikeButton__count js-like-count"></span>
      </button>
    </div>
  );
}
