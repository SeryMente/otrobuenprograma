<?php
declare(strict_types=1);
get_header();
?>
<main class="site-main">
  <header class="site-header">
    <div class="wrap">
      <h1 class="site-brand"><?php echo esc_html(get_bloginfo('name')); ?></h1>
      <p class="site-tagline"><?php echo esc_html(get_bloginfo('description')); ?></p>
    </div>
  </header>
  <div class="wrap">
    <?php
    if (have_posts()) {
      while (have_posts()) {
        the_post();
        the_title('<h2 class="entry-title">', '</h2>');
        the_content();
      }
    }
    ?>
  </div>
</main>
<?php get_footer(); ?>
