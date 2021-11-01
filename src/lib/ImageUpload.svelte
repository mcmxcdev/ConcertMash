<script lang="ts">
  import FilePond, { registerPlugin } from 'svelte-filepond';
  import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
  import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
  import FilePondPluginFileEncode from 'filepond-plugin-file-encode';
  import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
  import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

  import { afterUpdate } from 'svelte';

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
      playlistImage = fileItem.getFileEncodeBase64String();
    }
  }

  afterUpdate(() => {
    if (!playlistImage && pond) {
      pond.removeFile();
    }
  });
</script>

<FilePond
  bind:this={pond}
  name="filepond"
  onaddfile={handleAddFile}
  credits={false}
  maxFileSize="5MB"
  acceptedFileTypes={['image/jpeg']}
/>

<style global>
  @import 'filepond/dist/filepond.css';
  @import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
</style>
