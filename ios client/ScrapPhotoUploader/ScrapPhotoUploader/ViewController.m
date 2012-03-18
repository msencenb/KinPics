//
//  ViewController.m
//  ScrapPhotoUploader
//
//  Created by Matt Sencenbaugh on 3/2/12.
//  Copyright (c) 2012 Stanford University. All rights reserved.
//

#import "ViewController.h"
#import "ASIFormDataRequest.h"

@implementation ViewController
@synthesize picture, picker, imageView, filename, small_picture, large_picture, spinner;

-(void)addDownloadSpinner {
    NSArray *xib = [[NSBundle mainBundle] loadNibNamed:@"SpinnerView" owner:self options:nil]; 
    SpinnerView *view = [xib objectAtIndex:0];
    [view.spinner startAnimating];
    self.spinner = view;
    CGRect bounds = [[UIScreen mainScreen] bounds];
    CGRect spinBounds = view.bounds;
    [self.spinner setFrame:CGRectMake(bounds.size.width/2-spinBounds.size.width/2, bounds.size.height/2-spinBounds.size.height/2, spinBounds.size.width, spinBounds.size.height)];
    [[UIApplication sharedApplication].keyWindow addSubview:spinner];
}

-(void)removeDownloadSpinner {
    self.imageView.image = nil;
    [self.spinner removeFromSuperview];
}

- (void)requestFinished:(ASIHTTPRequest *)request {
    //Do response code checking based on request tag then call delegate
    
    [self removeDownloadSpinner];
    UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Success" message:@"Check KinPics on the Kinect to view your picture :)" delegate:nil cancelButtonTitle:@"Ok" otherButtonTitles: nil];
    [alert show];
    [alert release];
}

- (void)requestFailed:(ASIHTTPRequest *)request {
    [self removeDownloadSpinner];
    UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Woops..." message:@"Looks like the server isn't running, try again later" delegate:nil cancelButtonTitle:@"Ok" otherButtonTitles: nil];
    [alert show];
    [alert release];
}


#pragma mark uitextfielddelegate

- (void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex
{
    self.filename = [[alertView textFieldAtIndex:0] text];
}

- (BOOL)alertViewShouldEnableFirstOtherButton:(UIAlertView *)alertView
{
    NSString *inputText = [[alertView textFieldAtIndex:0] text];
    if( [inputText length] > 0 )
    {
        return YES;
    }
    else
    {
        return NO;
    }
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Release any cached data, images, etc that aren't in use.
}

- (void) closeCamera {
	[picker dismissModalViewControllerAnimated:YES];
}

- (void) imagePickerController:(UIImagePickerController *)picker didFinishPickingImage:(UIImage*) image editingInfo:(NSDictionary*)editingInfo {
	[self closeCamera];
	
    //Regular size
    CGSize regular = CGSizeMake(864, 589);
    UIGraphicsBeginImageContext(regular);
    [image drawInRect:CGRectMake(0,0,regular.width,regular.height)];
    UIImage* newImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
	picture = newImage;
    
    //Thumb
    CGSize small = CGSizeMake(144, 108);
    UIGraphicsBeginImageContext(small);
    [image drawInRect:CGRectMake(0,0,small.width,small.height)];
    UIImage* smallImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
	self.small_picture = smallImage;
    
    CGSize large = CGSizeMake(1280, 872);
    UIGraphicsBeginImageContext(large);
    [image drawInRect:CGRectMake(0,0,large.width,large.height)];
    UIImage* largeImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
	self.large_picture = largeImage;
    
    imageView.image = newImage;
    UIAlertView *name = [[UIAlertView alloc] initWithTitle:@"Picture Title" message:@"Please enter a single word title for your picture" delegate:self cancelButtonTitle:nil otherButtonTitles:@"Ok", nil];
    name.alertViewStyle = UIAlertViewStylePlainTextInput;
    [name show];
    [name release];
	
}



- (void)imagePickerControllerDidCancel:(UIImagePickerController *)picker
{
	[self closeCamera];
}




//RESPOND TO IMAGE SOURCE SELECTION
- (void)actionSheet:(UIActionSheet *)actionSheet didDismissWithButtonIndex:(NSInteger)buttonIndex {
	BOOL useCamera;
	if(buttonIndex != 1 && buttonIndex != 0) 
		return;
	
	//Camera
	if(buttonIndex == 0)
		useCamera = YES;
	//Use Existing
	else if(buttonIndex == 1)
		useCamera = NO;
	
	picker = [[UIImagePickerController alloc] init];
	picker.delegate = self;
	
	if(useCamera)
		picker.sourceType = UIImagePickerControllerSourceTypeCamera;
	else
		picker.sourceType = UIImagePickerControllerSourceTypeSavedPhotosAlbum;
	
	//[self.view.window addSubview:picker.view];
    [self presentModalViewController:picker animated:YES];
    [picker release];
}

-(IBAction)takePicture:(id)sender {
	UIActionSheet * actionSheet = [[UIActionSheet alloc] initWithTitle:@"Select Image Source" delegate:self cancelButtonTitle:@"Cancel" destructiveButtonTitle:nil otherButtonTitles:@"Take Picture", @"Use Existing", nil];
	[actionSheet showInView: self.view];
	[actionSheet release];    
}

-(IBAction)uploadPhoto{
    NSString *urlString = @"http://128.12.10.37:3780/user/1/photos";
    NSURL *url = [NSURL URLWithString:urlString];
    ASIFormDataRequest *req = [[ASIFormDataRequest alloc] initWithURL:url];
    [req addData:UIImageJPEGRepresentation(picture, 0.7) forKey:@"picture"];
    [req addData:UIImageJPEGRepresentation(small_picture, 0.7) forKey:@"small_picture"];
    [req addData:UIImageJPEGRepresentation(large_picture, 0.7) forKey:@"large_picture"];
    [req addPostValue:@"birthday" forKey:@"tags"];
    [req addPostValue:filename forKey:@"filename"];
    [self addDownloadSpinner];
    req.delegate = self;
    [req startAsynchronous];
}
#pragma mark - View lifecycle

- (void)viewDidLoad
{
    [super viewDidLoad];
	// Do any additional setup after loading the view, typically from a nib.
}

- (void)viewDidUnload
{
    [super viewDidUnload];
    // Release any retained subviews of the main view.
    // e.g. self.myOutlet = nil;
}

- (void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];

}

- (void)viewDidAppear:(BOOL)animated
{
    [super viewDidAppear:animated];
}

- (void)viewWillDisappear:(BOOL)animated
{
	[super viewWillDisappear:animated];
}

- (void)viewDidDisappear:(BOOL)animated
{
	[super viewDidDisappear:animated];
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    // Return YES for supported orientations
    return (interfaceOrientation == UIInterfaceOrientationLandscapeRight);
}

@end
