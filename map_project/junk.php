<table id="monthlyTable"  border="0" cellpadding="0" cellspacing="0">
    <div class="smallscreen-stackable">
        <hgroup>
            <h4>XBRL</h4>
            <?php if($item_date):?>
            <h6>(as of <?php echo $item_date->format('m/d/Y');?>)</h6>
            <?php endif;?>
            <br/>
        </hgroup>
    </div>
    <?php if($xbrl->files['base']) : ?>
        <tr>
            <td>Instance Document</td>
            <td class='text-right'>
                <a href='<?php echo JUri::base().'us/fund-documents/'. $this->item->alias.'?xbrl='.$xbrl->files['lab'];?>' target="_blank">
                <img src='/images/icons/download-xbrl.svg' alt="Icon to denote XBRL document"></a>
            </td>
        </tr>
    <?php endif; ?>

    <?php if($xbrl->files['xsd']) : ?>
        <tr>
            <td>SCHEMA</td> 
            <td class='text-right'>
                <a href='<?php echo JUri::base().'us/fund-documents/'. $this->item->alias.'?xbrl='.$xbrl->files['xsd'];?>' target="_blank">
                    <img src='/images/icons/download-xbrl.svg' alt="Icon to denote XBRL document">
                </a>
            </td>
        </tr>
    <?php endif; ?>

    <?php if($xbrl->files['lab']) : ?>
        <tr>
            <td>Labels Linkbase</td> 
            <td class='text-right'>
                <a href='<?php echo JUri::base().'us/fund-documents/'. $this->item->alias.'?xbrl='.$xbrl->files['lab'];?>' target="_blank">
                    <img src='/images/icons/download-xbrl.svg' alt="Icon to denote XBRL document">
                </a>
            </td>
        </tr>
    <?php endif; ?>

    <?php if($xbrl->files['pre']) : ?>
        <tr>
            <td>Presentation Linkbase</td> 
            <td class='text-right'>
                <a href='<?php echo JUri::base().'us/fund-documents/'. $this->item->alias.'?xbrl='.$xbrl->files['pre'];?>' target="_blank">
                    <img src='/images/icons/download-xbrl.svg' alt="Icon to denote XBRL document">
                </a>
            </td>
        </tr>
    <?php endif; ?>

    <?php if($xbrl->files['def']) : ?>
        <tr>
            <td>Definition Linkbase</td> 
            <td class='text-right'>
                <a href='<?php echo JUri::base().'us/fund-documents/'. $this->item->alias.'?xbrl='.$xbrl->files['def'];?>' target="_blank">
                    <img src='/images/icons/download-xbrl.svg' alt="Icon to denote XBRL document">
                </a>
            </td>
        </tr>
    <?php endif; ?>

    <?php if($xbrl->files['base']) : ?>
        <tr>
            <td>Download a zip of all the Files</td> 
            <td class='text-right'>
                <a href='<?php echo JUri::base().'us/fund-documents/'. $this->item->alias.'?xbrl='.'zip';?>' target="_blank">
                    <img src='/images/icons/download-xbrl.svg' alt="Icon to denote XBRL document">
                </a>
            </td>
        </tr>
    <?php endif; ?>
</table>