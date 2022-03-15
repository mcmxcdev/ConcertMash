<script lang="ts">
  import { FilePond as IFilePond, registerPlugin } from 'filepond';
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

  let pond: IFilePond;

  function handleAddFile(err: any, fileItem: any) {
    if (err) {
      console.error(err);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
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
  maxFileSize="256KB"
  acceptedFileTypes={['image/jpeg']}
  fileValidateTypeLabelExpectedTypes="Spotify API requires .jpeg"
/>

<style global>
  @import 'filepond/dist/filepond.css';
  @import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
</style>
