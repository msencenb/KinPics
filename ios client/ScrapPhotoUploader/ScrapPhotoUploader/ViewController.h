//
//  ViewController.h
//  ScrapPhotoUploader
//
//  Created by Matt Sencenbaugh on 3/2/12.
//  Copyright (c) 2012 Stanford University. All rights reserved.
//
#import "SpinnerView.h"
#import <UIKit/UIKit.h>

@interface ViewController : UIViewController <UINavigationControllerDelegate, UIActionSheetDelegate, UIImagePickerControllerDelegate>{
    SpinnerView *spinner;
    UIImagePickerController *picker;
    IBOutlet UIImageView *imageView;
    NSString *filename;
    UIImage *picture;
    UIImage *small_picture;
    UIImage *large_picture;
}

@property(nonatomic,retain)SpinnerView *spinner;
@property(nonatomic,retain)IBOutlet UIImageView *imageView;
@property(nonatomic,retain)UIImagePickerController *picker;
@property(nonatomic,retain)UIImage *picture;
@property(nonatomic,retain)UIImage *small_picture;
@property(nonatomic,retain)UIImage *large_picture;
@property(nonatomic,copy)NSString *filename;
-(IBAction)uploadPhoto;
-(IBAction)takePicture:(id)sender;

@end
