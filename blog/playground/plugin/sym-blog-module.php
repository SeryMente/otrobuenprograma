<?php
/**
 * Plugin Name: Ser y Mente Blog Module — Playground
 * Description: Reproduces the Ser y Mente dynamic blog module in a portable WordPress Playground environment.
 * Version: 0.1.0
 * Author: Ser y Mente / OGP reconstruction
 */

declare(strict_types=1);

add_action('wp_enqueue_scripts', static function (): void {
    wp_enqueue_style(
        'sym-blog-module',
        plugins_url('blog.css', __FILE__),
        [],
        '0.1.0'
    );
});

function sym_placeholder_image(string $title, int $width = 900, int $height = 600): string
{
    $label = htmlspecialchars($title ?: 'Ser y Mente', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' . $width . '" height="' . $height . '" viewBox="0 0 ' . $width . ' ' . $height . '"><rect width="100%" height="100%" fill="#eef2f7"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#233650" font-family="Arial,sans-serif" font-size="34">' . $label . '</text></svg>';
    return 'data:image/svg+xml;charset=UTF-8,' . rawurlencode($svg);
}

function sym_blog_post_markup(WP_Post $post, string $class): string
{
    $title = get_the_title($post);
    $excerpt = get_the_excerpt($post);
    $link = get_permalink($post);
    $image = get_the_post_thumbnail_url($post, 'large');

    if (!$image) {
        $image = sym_placeholder_image($title);
    }

    ob_start();
    ?>
    <div class="post <?php echo esc_attr($class); ?>">
        <a href="<?php echo esc_url($link); ?>">
            <img src="<?php echo esc_attr($image); ?>" alt="<?php echo esc_attr($title); ?>">
        </a>
        <?php if ($class === 'large-post') : ?>
            <h2><a href="<?php echo esc_url($link); ?>"><?php echo esc_html($title); ?></a></h2>
        <?php else : ?>
            <h3><a href="<?php echo esc_url($link); ?>"><?php echo esc_html($title); ?></a></h3>
        <?php endif; ?>
        <p><?php echo esc_html($excerpt); ?></p>
    </div>
    <?php
    return (string) ob_get_clean();
}

function custom_blog_section_shortcode(): string
{
    $query = new WP_Query([
        'post_type'      => 'post',
        'posts_per_page' => 6,
        'orderby'        => 'date',
        'order'          => 'DESC',
    ]);

    if (!$query->have_posts()) {
        return '<div class="blog-section-1"><p>No posts found.</p></div>';
    }

    $posts = $query->posts;
    $left = '';
    $center = '';
    $right = '';

    foreach ($posts as $index => $post) {
        if ($index < 2) {
            $left .= sym_blog_post_markup($post, 'small-post');
        } elseif ($index === 2) {
            $center .= sym_blog_post_markup($post, 'large-post');
        } else {
            $right .= sym_blog_post_markup($post, 'small-post');
        }
    }

    wp_reset_postdata();

    return '<div class="blog-section-1">'
        . '<div class="left-column">' . $left . '</div>'
        . '<div class="center-post">' . $center . '</div>'
        . '<div class="right-column">' . $right . '</div>'
        . '</div>';
}
add_shortcode('custom_blog_section', 'custom_blog_section_shortcode');

function ser_y_mente_blog_section_2(): string
{
    $query = new WP_Query([
        'post_type'      => 'post',
        'posts_per_page' => 3,
        'post_status'    => 'publish',
    ]);

    if (!$query->have_posts()) {
        return '<p>No posts found.</p>';
    }

    ob_start();
    echo '<div class="blog-section-2">';
    while ($query->have_posts()) {
        $query->the_post();
        $image = get_the_post_thumbnail_url(get_the_ID(), 'medium');
        if (!$image) {
            $image = sym_placeholder_image(get_the_title(), 600, 400);
        }
        ?>
        <div class="post">
            <a href="<?php the_permalink(); ?>">
                <img src="<?php echo esc_attr($image); ?>" alt="<?php echo esc_attr(get_the_title()); ?>">
            </a>
            <div class="post-content">
                <h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
                <p><?php echo esc_html(wp_trim_words(get_the_excerpt(), 30)); ?></p>
            </div>
        </div>
        <?php
    }
    echo '</div>';
    wp_reset_postdata();

    return (string) ob_get_clean();
}
add_shortcode('ser_y_mente_blog_section_2', 'ser_y_mente_blog_section_2');
