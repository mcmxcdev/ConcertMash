<script lang="ts">
  import { registerPlugin } from 'filepond';
  import FilePondPluginFileEncode from 'filepond-plugin-file-encode';
  import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
  import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
  import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
  import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
  import { afterUpdate } from 'svelte';
  import FilePond from 'svelte-filepond';

  registerPlugin(
    FilePondPluginImageExifOrientation,
    FilePondPluginImagePreview,
    FilePondPluginFileEncode,
    FilePondPluginFileValidateSize,
    FilePondPluginFileValidateType,
  );

  export let playlistImage = '';

  let pond: any;

  function handleAddFile(err: any, fileItem: any) {
    if (err) {
      console.error(err);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      playlistImage = fileItem.getFileEncodeBase64String();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-deprecated
  afterUpdate(() => {
    if (!playlistImage && pond) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      pond.removeFile();
    }
  });
</script>

<FilePond
  bind:this={pond}
  name="filepond"
  onaddfile={handleAddFile}
  credits={false}
  maxFileSize="256KB"
  acceptedFileTypes={['image/jpeg']}
  fileValidateTypeLabelExpectedTypes="Spotify API requires .jpeg"
/>

<style global>
  @import 'filepond/dist/filepond.css';
  @import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

  /* Dark theme for FilePond drop area (global: FilePond injects this DOM) */
  /*
    FilePond builds its panel from three stacked sub-panels (top/center/bottom)
    that all share `.filepond--panel-root`. Bordering that class draws a line
    between the sub-panels (the "nested border" look), so the single border,
    radius and fill live on the outer `.filepond--root` instead, with the
    sub-panels left transparent and borderless.
  */
  :global(.filepond--root) {
    margin-bottom: 0;
    background-color: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.5rem;
    overflow: hidden;
  }

  :global(.filepond--panel-root) {
    background-color: transparent;
    border: none;
  }

  :global(.filepond--drop-label) {
    color: #a3a3a3;
  }

  :global(.filepond--label-action) {
    text-decoration-color: #1ed760;
    color: #1ed760;
  }

  :global(.filepond--drip-blob) {
    background-color: rgba(255, 255, 255, 0.2);
  }
</style>
